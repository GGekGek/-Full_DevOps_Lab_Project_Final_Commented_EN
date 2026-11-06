/**
 * Integration test for GET /api/metrics (DEVOPS-12, adapted in SCRUM-43).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

describe('GET /api/metrics', () => {
  it('returns system and platform stats', async () => {
    const res = await request(app).get('/api/metrics')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(['warming-up', 'healthy', 'steady']).toContain(res.body.status)
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(res.body.node).toMatch(/^v\d+/)
    expect(res.body.platform).toEqual({
      students: expect.any(Number),
      studentsWithoutInternship: expect.any(Number),
      companies: expect.any(Number),
      offers: { open: expect.any(Number), closed: expect.any(Number) },
      applications: { pending: expect.any(Number), accepted: expect.any(Number), rejected: expect.any(Number) }
    })
  })
})
