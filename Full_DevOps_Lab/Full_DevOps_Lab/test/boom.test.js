/**
 * Integration test for GET /boom.
 * Ensures global error handler shapes the response.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, vi } from 'vitest'

describe('GET /boom', () => {
  it('returns 500 with a generic error payload and logs the error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await request(app).get('/boom')
    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: true, message: 'Internal Server Error' })
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
})
