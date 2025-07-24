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
	const data = c.req.valid('json')
	try {
		await createUser(data.name, data.email, data.password, data.invitationCode, c.env)
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
