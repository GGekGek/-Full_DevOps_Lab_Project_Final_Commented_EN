/**
 * Integration tests for /api/doctors (DEVOPS-10).
 * The store is reset before each test so tests do not depend on order.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDoctors } from '../src/utils/doctors.js'

describe('/api/doctors', () => {
  beforeEach(() => resetDoctors())

  it('GET returns an array of doctors', async () => {
    const res = await request(app).get('/api/doctors')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })

  it('GET ?specialty=cardiology filters (case-insensitive)', async () => {
    const res = await request(app).get('/api/doctors?specialty=cardiology')
    expect(res.status).toBe(200)
    expect(res.body.map(d => d.name)).toEqual(['Dr. Sarah Lee'])
  })

  it('GET /:id returns one doctor', async () => {
    const res = await request(app).get('/api/doctors/1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 1, name: 'Dr. Sarah Lee', specialty: 'Cardiology' })
  })

  it('GET /:id returns 404 for an unknown doctor', async () => {
    const res = await request(app).get('/api/doctors/999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: true, message: 'Doctor not found' })
  })

  it('POST adds a new doctor', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .send({ name: 'Dr. Julie', specialty: 'Neurology' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toEqual({ id: 3, name: 'Dr. Julie', specialty: 'Neurology' })
  })

  it('POST with a missing field returns 400', async () => {
    const res = await request(app).post('/api/doctors').send({ name: 'Dr. NoSpecialty' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
    expect(res.body.message).toMatch(/Missing required fields/)
  })
})
