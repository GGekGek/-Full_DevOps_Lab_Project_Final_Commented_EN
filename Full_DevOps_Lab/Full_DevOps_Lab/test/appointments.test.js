/**
 * Integration tests for /api/appointments (DEVOPS-11).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetAppointments } from '../src/utils/appointments.js'

describe('/api/appointments', () => {
  beforeEach(() => resetAppointments())

  it('GET returns appointments with doctor and patient names', async () => {
    const res = await request(app).get('/api/appointments')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toMatchObject({ id: 1, doctor: 'Dr. Sarah Lee', patient: 'Alice' })
  })

  it('POST schedules a visit', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: 2, patientId: 1, date: '2026-12-15T10:30:00Z' })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 2, doctorId: 2, patientId: 1, date: '2026-12-15T10:30:00.000Z' })
  })

  it('POST with a missing field returns 400', async () => {
    const res = await request(app).post('/api/appointments').send({ doctorId: 1 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
    expect(res.body.message).toMatch(/Missing required fields/)
  })

  it('POST with an invalid date returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: 1, patientId: 1, date: 'not-a-date' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('date must be a valid date')
  })

  it('POST with an unknown doctor returns 404', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: 999, patientId: 1, date: '2026-12-15' })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Doctor not found')
  })

  it('POST with an unknown patient returns 404', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({ doctorId: 1, patientId: 999, date: '2026-12-15' })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Patient not found')
  })
})
