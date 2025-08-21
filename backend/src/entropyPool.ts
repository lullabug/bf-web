import { DurableObject } from 'cloudflare:workers'
import { th } from 'zod/locales'

export class EntropyPool extends DurableObject<Env> {
	state!: string
    entropy!: number

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)

		ctx.blockConcurrencyWhile(async () => {
			const state = await ctx.storage.get<string>('entropyPoolState')
			if (state) {
				this.state = state
			} else {
				this.state = env.ENTROPY_POOL_INIT_STATE
				await ctx.storage.put('entropyPoolState', this.state)
			}
            const entropy = await ctx.storage.get<number>('entropyPoolEntropy')
            if (entropy) {
                this.entropy = entropy
            } else {
                this.entropy = parseInt(env.ORIGIN_ENTROPY, 10)
                await ctx.storage.put('entropyPoolEntropy', this.entropy)
            }
		})
	}

	getState(): string {
		return this.state
	}

    getEntropy(): number {
        return this.entropy
    }

	async updateState(): Promise<string> {
        const msg = getTimestampUsPart()
        const newState = await hashHmacSha256(this.state, msg)
        const newEntropy = this.entropy + parseFloat(this.env.TIMESTAMP_ENTROPY)

        await this.ctx.storage.put({
            'entropyPoolState': newState,
            'entropyPoolEntropy': newEntropy
        })

        this.state = newState
        this.entropy = newEntropy
        return newState
    }

	async peekRandomInt(exclusiveUpperBound: bigint): Promise<bigint | null> {
		const entropySrc = BigInt('0x' + this.getState())
		return fairRandomInt(exclusiveUpperBound, entropySrc)
	}

}

async function hashHmacSha256(key: string, msg: string): Promise<string> {
	const encoder = new TextEncoder()
	const keyBuffer = encoder.encode(key)
	const msgBuffer = encoder.encode(msg)

	const keyObj = await crypto.subtle.importKey(
		'raw',
		keyBuffer,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	)

	const signature = await crypto.subtle.sign('HMAC', keyObj, msgBuffer)

	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

function getTimestampUsPart() {
    const timestampMs = performance.timeOrigin + performance.now()
    const timestampUs = BigInt(Math.floor(timestampMs * 1000)) % BigInt(1e6)
    return timestampUs.toString()
}

function fairRandomInt(exclusiveUpperBound: bigint, entropySrc: bigint): bigint | null {
	if (exclusiveUpperBound <= 0n) {
		throw new Error('exclusiveUpperBound must be greater than 0')
	}
	if (exclusiveUpperBound === 1n) {
		return 0n
	}
	if (entropySrc < 0n) {
		throw new Error('entropySrc must be non-negative')
	}
	const neededBits = BigInt((exclusiveUpperBound - 1n).toString(2).length)
	const mask = (1n << neededBits) - 1n

	let entropy = entropySrc
	while (entropy > 0n) {
		const randomBits = entropy & mask
		if (randomBits < exclusiveUpperBound) {
			return randomBits
		}
		entropy >>= neededBits
	}
	return null
}
