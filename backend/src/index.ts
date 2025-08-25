/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
	createUser,
	getUserInfo,
	InvitationCodeError,
	PasswordMismatchError,
	UserExistsError,
	UserNotFoundError,
	userRegisterationSchema,
	userVerificationSchema,
	verifyUser,
} from './users'
import {
	clearExpiredSessions,
	createSession,
	deleteSession,
	getUserIdFromSession,
} from './sessions'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { clearExpiredEvents, getEvents } from './events'
import { EntropyPool } from './entropyPool'

export { EntropyPool } from './entropyPool'

const app = new Hono<{ Bindings: Env }>()

app.use(
	'api/*',
	cors({
		origin: 'http://localhost:5173',
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
	})
)

app.get('/api/test', (c) => {
	return c.text('Hello world!')
})

app.get('/api/user/logout', async (c) => {
	const sessionId = getCookie(c, 'sessionId')
	if (sessionId) {
		await deleteSession(sessionId, c.env)
		deleteCookie(c, 'sessionId', {
			httpOnly: true,
			sameSite: 'Lax',
			secure: c.env.NODE_ENV === 'prod',
		})
	}
	const redirectPath = c.req.query('redirectPath') || '/'
	return c.json({ status: 'success', redirectPath }, 200)
})

app.post('/api/user/register', zValidator('json', userRegisterationSchema), async (c) => {
	const today = new Date()
	const targetDate = new Date('2025-08-31T17:59:59+08:00')
	if (today.getTime() >= targetDate.getTime()) {
		return c.json({ status: 'error', message: 'Registration has closed.'}, 403)
	}

	const data = c.req.valid('json')
	try {
		await createUser(data.name, data.email, data.password, data.invitationCode, c.env)

		const id: DurableObjectId = c.env.ENTROPY_POOL.idFromName('entropy-pool-20250809')
		const entropyPool = c.env.ENTROPY_POOL.get(id) as DurableObjectStub<EntropyPool>
		await entropyPool.updateState()
	} catch (error) {
		console.error('User registration error:', error)
		if (error instanceof UserExistsError) {
			return c.json({ status: 'error', message: error.message }, 409)
		} else if (error instanceof InvitationCodeError) {
			return c.json({ status: 'error', message: error.message }, 400)
		} else {
			return c.json({ status: 'error', message: 'Internal server error' }, 500)
		}
	}
	return c.json({ status: 'success' }, 201)
})

app.post('/api/user/verify', zValidator('json', userVerificationSchema), async (c) => {
	const data = c.req.valid('json')
	const { nameOrEmail, password } = data
	try {
		const userId = await verifyUser(nameOrEmail, password, c.env)
		const sessionId = await createSession(userId, c.env)
		setCookie(c, 'sessionId', sessionId, {
			httpOnly: true,
			sameSite: 'Lax',
			secure: c.env.NODE_ENV === 'prod',
			maxAge: parseInt(c.env.SESSION_LIFETIME_SECONDS),
			path: '/',
		})
	} catch (error) {
		console.error('User verification error:', error)
		if (error instanceof PasswordMismatchError || error instanceof UserNotFoundError) {
			return c.json({ status: 'error', message: 'Invalid credentials' }, 401)
		}
		return c.json({ status: 'error', message: 'Internal server error' }, 500)
	}
	return c.json({ status: 'success' }, 200)
})

app.get('/api/user/info', async (c) => {
	const sessionId = getCookie(c, 'sessionId')
	if (!sessionId) {
		return c.json({ status: 'error', message: 'Not authenticated' }, 401)
	}
	const userId = await getUserIdFromSession(sessionId, c.env)
	if (!userId) {
		return c.json({ status: 'error', message: 'Session expired or invalid' }, 401)
	}
	try {
		const userInfo = await getUserInfo(userId, c.env)
		return c.json({ status: 'success', userInfo: userInfo }, 200)
	} catch (error) {
		if (error instanceof UserNotFoundError) {
			return c.json({ status: 'error', message: error.message }, 404)
		}
		console.error('Error fetching user info:', error)
		return c.json({ status: 'error', message: 'Internal server error' }, 500)
	}
})

app.get('/api/events/:series', async (c) => {
	const series = c.req.param('series')
	const defaultNum = parseInt(c.env.EVENTS_GET_NUM_DEFAULT) || 100
	const queryNum = c.req.query('num')
	let num = queryNum ? parseInt(queryNum) : defaultNum

	if (isNaN(num) || num <= 0) {
		num = defaultNum
	}
	if (num > defaultNum) {
		num = defaultNum
	}

	try {
		const rs = await getEvents(num, series, c.env)
		return c.json({ status: 'success', events: rs }, 200)
	} catch (error) {
		console.error('Error fetching events:', error)
		return c.json({ status: 'error', message: 'Internal server error' }, 500)
	}
})

app.get('/api/entropy-pool/:entropy_pool/entropy', async (c) => {
	const poolName = c.req.param('entropy_pool')
	const id: DurableObjectId = c.env.ENTROPY_POOL.idFromName(poolName)
	const entropyPool = c.env.ENTROPY_POOL.get(id) as DurableObjectStub<EntropyPool>
	const entropy = await entropyPool.getEntropy()
	return c.json({ status: 'success', entropy: entropy }, 200)
})

app.get('/api/entropy-pool/:entropy_pool/result', async (c) => {
	const today = new Date()
	const targetDate = new Date('2025-08-31T18:00:00+08:00')
	if (today.getTime() < targetDate.getTime()) {
		return c.json({ status: 'error', message: 'Not yet available' }, 403)
	}

	const poolName = c.req.param('entropy_pool')
	const keyName = poolName + '-result'
	const rs = await c.env.KV_STORE.get(keyName, 'text')
	if (rs) {
		return c.json({ status: 'success', result: rs }, 200)
	} else {
		const d1 = c.env.D1_DB
		const userCountStmt = d1.prepare('SELECT COUNT(*) as count FROM users')
		const userCount = await userCountStmt
			.bind()
			.first<{ count: number }>()
		if (!userCount) {
			return c.json({ status: 'error', message: 'Internal server error' }, 500)
		}
		const userNum = userCount.count

		const id: DurableObjectId = c.env.ENTROPY_POOL.idFromName(poolName)
		const entropyPool = c.env.ENTROPY_POOL.get(id) as DurableObjectStub<EntropyPool>
		const index = Number(await entropyPool.peekRandomInt(BigInt(userNum)))
		const uidStmt = d1.prepare('SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET ?')
		const userIdQuery = await uidStmt.bind(index).first<{ id: string }>()
		if (!userIdQuery) {
			return c.json({ status: 'error', message: 'User not found' }, 404)
		}
		const uid = userIdQuery.id

		const invitationCodeStmt = d1.prepare('SELECT code FROM invitation_codes WHERE used_by = ?')
		const invitationCodeQuery = await invitationCodeStmt.bind(uid).first<{ code: string }>()
		if (!invitationCodeQuery) {
			return c.json({ status: 'error', message: 'Invitation code not found' }, 404)
		}
		const code = invitationCodeQuery.code
		await c.env.KV_STORE.put(keyName, code)
		return c.json({ status: 'success', result: code }, 200)
	}
})

// Catch-all route to proxy requests to the frontend
app.all('*', async (c) => {
	const frontendUrl = c.env.FRONTEND_BASE_URL
	if (!frontendUrl) {
		return c.json({ status: 'error', message: 'Internal server error' }, 500)
	}
	const url = new URL(c.req.url)
	const targetUrl = new URL(url.pathname + url.search, frontendUrl)
	return await fetch(new Request(targetUrl, c.req.raw))
})

export default {
	fetch: app.fetch,

	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		clearExpiredSessions(env)
		clearExpiredEvents(env)
	},
}
