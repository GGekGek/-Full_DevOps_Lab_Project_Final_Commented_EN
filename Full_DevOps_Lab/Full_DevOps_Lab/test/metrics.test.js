/**
 * Integration test for GET /api/metrics (DEVOPS-12).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('GET /api/metrics', () => {
  it('returns system and hospital stats', async () => {
    const res = await request(app).get('/api/metrics')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(['warming-up', 'healthy', 'steady']).toContain(res.body.status)
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(res.body.node).toMatch(/^v\d+/)
    expect(res.body.hospital).toEqual({
      doctors: expect.any(Number),
      patients: expect.any(Number),
      appointments: expect.any(Number)
    })
  })
})
