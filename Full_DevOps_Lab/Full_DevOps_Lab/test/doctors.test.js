/**
 * Integration tests for /api/doctors (DEVOPS-10).
 * The store is reset before each test so tests do not depend on order.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetDoctors } from '../src/utils/doctors.js'
import { resetAppointments } from '../src/utils/appointments.js'

describe('/api/doctors', () => {
  beforeEach(() => {
    resetDoctors()
    resetAppointments()
  })

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

  // ----- PUT (DEVOPS-14) -----
  it('PUT /:id updates only the fields sent', async () => {
    const res = await request(app).put('/api/doctors/2').send({ specialty: 'Neonatology' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 2, name: 'Dr. Amir Khan', specialty: 'Neonatology' })

    const check = await request(app).get('/api/doctors/2')
    expect(check.body.specialty).toBe('Neonatology')
  })

  it('PUT /:id returns 404 for an unknown doctor', async () => {
    const res = await request(app).put('/api/doctors/999').send({ name: 'Dr. Ghost' })
    expect(res.status).toBe(404)
  })

  it('PUT /:id with no valid field returns 400', async () => {
    const res = await request(app).put('/api/doctors/1').send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/at least one field/)
  })

  it('PUT /:id with an empty name returns 400', async () => {
    const res = await request(app).put('/api/doctors/1').send({ name: '  ' })
    expect(res.status).toBe(400)
  })

  // ----- DELETE (DEVOPS-14) -----
  it('DELETE /:id removes a doctor without appointments (204)', async () => {
    const created = await request(app).post('/api/doctors').send({ name: 'Dr. Temp', specialty: 'Surgery' })
    const res = await request(app).delete(`/api/doctors/${created.body.id}`)
    expect(res.status).toBe(204)
    expect(res.body).toEqual({})

    const check = await request(app).get(`/api/doctors/${created.body.id}`)
    expect(check.status).toBe(404)
  })

  it('DELETE /:id returns 404 for an unknown doctor', async () => {
    const res = await request(app).delete('/api/doctors/999')
    expect(res.status).toBe(404)
  })

  it('DELETE /:id returns 409 when the doctor still has appointments', async () => {
    const res = await request(app).delete('/api/doctors/1')
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/still has appointments/)
  })
})
