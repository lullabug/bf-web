import z from 'zod'

const pbkdf2Iterations = 10000
const pdkdf2HashAlgorithm = 'SHA-256'

export class UserExistsError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'UserExistsError'
	}
}

export class InvitationCodeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvitationCodeError'
	}
}

async function checkUserUnique(name: string, email: string, env: Env) {
	const user = await env.D1_DB.prepare(
		'SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1'
	)
		.bind(name, email)
		.first()
	if (user) {
		throw new UserExistsError('User with this name or email already exists')
	}
}

async function verifyInvitationCode(code: string, env: Env) {
	const rs = await env.D1_DB.prepare(
		'SELECT code_status FROM invitation_codes WHERE code = ? LIMIT 1'
	)
		.bind(code)
		.first<{ code_status: string }>()
	if (!rs) {
		console.log('Invitation code not found:', code)
		return false
	}
	if (rs.code_status !== 'available') {
		console.log('Invitation code is not available:', code)
		return false
	}
	return true
}

export async function createUser(
	name: string,
	email: string,
	password: string,
	invitationCode: string,
	env: Env
) {
	if (!(await verifyInvitationCode(invitationCode, env))) {
		throw new InvitationCodeError('Invalid or already used invitation code')
	}
	await checkUserUnique(name, email, env)
	const passwordSalt = crypto.getRandomValues(new Uint8Array(16))
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	)
	const hashBuf = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			hash: pdkdf2HashAlgorithm,
			salt: passwordSalt,
			iterations: pbkdf2Iterations,
		},
		keyMaterial,
		256
	)

	const saltHex = Array.from(passwordSalt)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
	const hashHex = Array.from(new Uint8Array(hashBuf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')

	const id = crypto.randomUUID()

	const invitationCodesStmt = env.D1_DB.prepare(
		'UPDATE invitation_codes SET code_status = "used", used_at = CURRENT_TIMESTAMP, used_by = ? WHERE code = ? AND code_status = "available"'
	).bind(id, invitationCode)

	const usersStmt = env.D1_DB.prepare(
		'INSERT INTO users (id, username, email, hashed_password, password_salt, password_iterations, password_algorithm) VALUES (?, ?, ?, ?, ?, ?, ?)'
	).bind(id, name, email, hashHex, saltHex, pbkdf2Iterations, pdkdf2HashAlgorithm)

	const [invitationCodesRs, usersRs] = await env.D1_DB.batch([invitationCodesStmt, usersStmt])
	if (invitationCodesRs.meta.changes === 0 || usersRs.meta.changes === 0) {
		throw new Error('Failed to create user or use invitation code')
	}
	return id
}

export class UserNotFoundError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'UserNotFoundError'
	}
}

export class PasswordMismatchError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'PasswordMismatchError'
	}
}

interface UserRecord {
	id: string
	hashed_password: string
	password_salt: string
	password_iterations: number
	password_algorithm: string
}

export async function verifyUser(nameOrEmail: string, password: string, env: Env) {
	const user = await env.D1_DB.prepare(
		'SELECT id, hashed_password, password_salt, password_iterations, password_algorithm FROM users WHERE username = ? OR email = ? LIMIT 1'
	)
		.bind(nameOrEmail, nameOrEmail)
		.first<UserRecord>()

	if (!user) {
		console.log('User not found:', nameOrEmail)
		throw new UserNotFoundError('User not found')
	}

	const passwordSalt = new Uint8Array(
		user.password_salt.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
	)
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	)
	const hashBuf = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			hash: user.password_algorithm,
			salt: passwordSalt,
			iterations: user.password_iterations,
		},
		keyMaterial,
		256
	)

	const newHashBytes = new Uint8Array(hashBuf)
	const storedHashBytes = new Uint8Array(
		user.hashed_password.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
	)

	const hashMatch = crypto.subtle.timingSafeEqual(storedHashBytes, newHashBytes)

	if (!hashMatch) {
		console.log('Password mismatch for user:', nameOrEmail)
		throw new PasswordMismatchError('Password mismatch')
	}

	await env.D1_DB.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')
		.bind(user.id)
		.run()

	return user.id
}

export const userRegisterationSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email format'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	invitationCode: z.string().min(1, 'Invitation code is required'),
})

export const userVerificationSchema = z.object({
	nameOrEmail: z.string().min(1, 'Name is required'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function getUserInfo(userId: string, env: Env) {
	const user = await env.D1_DB.prepare(
		'SELECT username, email, created_at, last_login_at FROM users WHERE id = ?'
	)
		.bind(userId)
		.first<{
			username: string
			email: string
			created_at: string
			last_login_at?: string
		}>()

	if (!user) {
		console.log('User not found:', userId)
		throw new UserNotFoundError('User not found')
	}

	return {
		name: user.username,
		email: user.email,
		createdAt: user.created_at,
		lastLoginAt: user.last_login_at || new Date().toISOString(),
	}
}
