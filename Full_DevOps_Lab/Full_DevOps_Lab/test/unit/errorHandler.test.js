/**
 * Unit tests for src/utils/errorHandler.js.
 * We stub a minimal `res` object to capture status and body.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { errorHandler, httpError } from '../../src/utils/errorHandler.js'

function makeRes () {
  return {
    statusCode: 0,
    body: null,
    status (code) { this.statusCode = code; return this },
    json (obj) { this.body = obj; return this }
  }
}

describe('errorHandler', () => {
  afterEach(() => vi.restoreAllMocks())

  it('defaults to 500 with generic message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = makeRes()
    errorHandler({}, {}, res, () => {})
    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: true, message: 'Internal Server Error' })
  })

  it('uses provided status and message', () => {
    const res = makeRes()
    errorHandler({ status: 418, message: 'teapot' }, {}, res, () => {})
    expect(res.statusCode).toBe(418)
    expect(res.body).toEqual({ error: true, message: 'teapot' })
  })

  it('logs unexpected errors and hides their message (DEVOPS-14)', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('database password is wrong')
    const res = makeRes()
    errorHandler(err, {}, res, () => {})
    expect(log).toHaveBeenCalledWith(err)
    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe('Internal Server Error')
  })

  it('falls back to a generic message for a 4xx error without message', () => {
    const res = makeRes()
    errorHandler({ status: 400 }, {}, res, () => {})
    expect(res.body).toEqual({ error: true, message: 'Error' })
  })
})

describe('httpError', () => {
  it('creates an Error with a status', () => {
    const err = httpError(409, 'Conflict')
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(409)
    expect(err.message).toBe('Conflict')
  })
})
