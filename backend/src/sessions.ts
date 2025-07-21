export async function createSession(userId: string, env: Env) {
	const sessionId = crypto.randomUUID()
	const lifetimeMs = parseInt(env.SESSION_LIFETIME_SECONDS) * 1000
	const expiresAt = new Date(Date.now() + lifetimeMs)
	await env.D1_DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
		.bind(sessionId, userId, expiresAt.toISOString())
		.run()
    return sessionId
}

export async function getUserIdFromSession(sessionId: string, env: Env) {
    const session = await env.D1_DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?')
        .bind(sessionId, new Date().toISOString())
        .first<{ user_id: string }>()
    if (!session) {
        console.log('Session not found or expired:', sessionId)
        return null
    }
    return session.user_id
}

export async function deleteSession(sessionId: string, env: Env) {
    const result = await env.D1_DB.prepare('DELETE FROM sessions WHERE id = ?')
        .bind(sessionId)
        .run()
    if (result.meta.changes === 0) {
        console.log('No session deleted for ID:', sessionId)
    }
}

export async function clearExpiredSessions(env: Env) {
    const result = await env.D1_DB.prepare('DELETE FROM sessions WHERE expires_at <= ?')
        .bind(new Date().toISOString())
        .run()
    if (result.meta.changes > 0) {
        console.log(`Cleared ${result.meta.changes} expired sessions`)
    } else {
        console.log('No expired sessions to clear')
    }
}

