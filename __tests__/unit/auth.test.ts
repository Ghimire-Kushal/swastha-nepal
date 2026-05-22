/**
 * @jest-environment node
 */
import { signToken, verifyToken } from '@/lib/auth'
import type { SessionPayload } from '@/types/auth'

// next/headers is used in getSession/setAuthCookie — mock it so unit tests don't need a Next.js runtime
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

const TEST_SECRET = 'test-secret-for-unit-tests-at-least-32-chars!!'

describe('JWT auth helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
  })

  const PAYLOAD: Omit<SessionPayload, 'iat' | 'exp'> = {
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'patient',
  }

  it('signToken returns a JWT string', async () => {
    const token = await signToken(PAYLOAD)
    expect(typeof token).toBe('string')
    // JWTs have 3 base64url parts separated by dots
    expect(token.split('.').length).toBe(3)
  })

  it('verifyToken round-trips the payload', async () => {
    const token = await signToken(PAYLOAD)
    const decoded = await verifyToken(token)

    expect(decoded.sub).toBe(PAYLOAD.sub)
    expect(decoded.email).toBe(PAYLOAD.email)
    expect(decoded.name).toBe(PAYLOAD.name)
    expect(decoded.role).toBe(PAYLOAD.role)
  })

  it('verifyToken rejects a tampered token', async () => {
    const token = await signToken(PAYLOAD)
    const [h, p, sig] = token.split('.')
    const tampered = `${h}.${p}.${sig}xx`
    await expect(verifyToken(tampered)).rejects.toThrow()
  })

  it('verifyToken rejects a token signed with a different secret', async () => {
    const token = await signToken(PAYLOAD)
    process.env.JWT_SECRET = 'completely-different-secret-at-least-32-chars!!'
    await expect(verifyToken(token)).rejects.toThrow()
  })

  it('throws when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET
    await expect(signToken(PAYLOAD)).rejects.toThrow('JWT_SECRET')
  })
})
