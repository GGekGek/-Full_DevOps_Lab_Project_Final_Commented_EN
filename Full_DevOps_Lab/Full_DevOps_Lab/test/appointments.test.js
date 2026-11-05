/**
 * Integration tests for /api/appointments (DEVOPS-11).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetAppointments } from '../src/utils/appointments.js'

describe('/api/appointments', () => {
  beforeEach(() => resetAppointments())

  // ----- GET by id, PUT, DELETE (DEVOPS-16) -----
  it('GET /:id returns one appointment with names', async () => {
    const res = await request(app).get('/api/appointments/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, doctor: 'Dr. Sarah Lee', patient: 'Alice' })
  })

  it('GET /:id returns 404 for an unknown appointment', async () => {
    const res = await request(app).get('/api/appointments/999')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Appointment not found')
  })

  it('PUT /:id reschedules an appointment', async () => {
    const res = await request(app).put('/api/appointments/1').send({ date: '2026-12-20T14:00:00Z' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 1, doctorId: 1, patientId: 1, date: '2026-12-20T14:00:00.000Z' })
  })

  it('PUT /:id can change the doctor', async () => {
    const res = await request(app).put('/api/appointments/1').send({ doctorId: 2 })
    expect(res.status).toBe(200)
    const check = await request(app).get('/api/appointments/1')
    expect(check.body.doctor).toBe('Dr. Amir Khan')
  })

  it('PUT /:id returns 404 for an unknown appointment', async () => {
    const res = await request(app).put('/api/appointments/999').send({ date: '2026-12-20' })
    expect(res.status).toBe(404)
  })

  it('PUT /:id returns 400 with no field or an invalid date', async () => {
    expect((await request(app).put('/api/appointments/1').send({})).status).toBe(400)
    expect((await request(app).put('/api/appointments/1').send({ date: 'soon' })).status).toBe(400)
  })

  it('PUT /:id returns 404 for an unknown doctor or patient', async () => {
    const doc = await request(app).put('/api/appointments/1').send({ doctorId: 999 })
    expect(doc.status).toBe(404)
    expect(doc.body.message).toBe('Doctor not found')
    const pat = await request(app).put('/api/appointments/1').send({ patientId: 999 })
    expect(pat.body.message).toBe('Patient not found')
  })

  it('DELETE /:id cancels an appointment (204)', async () => {
    const res = await request(app).delete('/api/appointments/1')
    expect(res.status).toBe(204)
    expect((await request(app).get('/api/appointments/1')).status).toBe(404)
  })

  it('DELETE /:id returns 404 for an unknown appointment', async () => {
    const res = await request(app).delete('/api/appointments/999')
    expect(res.status).toBe(404)
  })

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
