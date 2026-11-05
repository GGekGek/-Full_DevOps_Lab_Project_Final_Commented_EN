/**
 * Integration tests for /api/patients (DEVOPS-9).
 * The store is reset before each test so tests do not depend on order.
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetPatients } from '../src/utils/patients.js'
import { resetAppointments } from '../src/utils/appointments.js'

describe('/api/patients', () => {
  beforeEach(() => {
    resetPatients()
    resetAppointments()
  })

  // ----- PUT (DEVOPS-15) -----
  it('PUT /:id updates only the fields sent', async () => {
    const res = await request(app).put('/api/patients/2').send({ age: 46 })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 2, name: 'John', age: 46 })
  })

  it('PUT /:id returns 404 for an unknown patient', async () => {
    const res = await request(app).put('/api/patients/999').send({ age: 20 })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Patient not found')
  })

  it('PUT /:id with no valid field returns 400', async () => {
    const res = await request(app).put('/api/patients/1').send({ city: 'Paris' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/at least one field/)
  })

  it('PUT /:id with an invalid age returns 400', async () => {
    const res = await request(app).put('/api/patients/1').send({ age: 200 })
    expect(res.status).toBe(400)
  })

  // ----- DELETE (DEVOPS-15) -----
  it('DELETE /:id removes a patient without appointments (204)', async () => {
    const res = await request(app).delete('/api/patients/2')
    expect(res.status).toBe(204)
    const check = await request(app).get('/api/patients/2')
    expect(check.status).toBe(404)
  })

  it('DELETE /:id returns 404 for an unknown patient', async () => {
    const res = await request(app).delete('/api/patients/999')
    expect(res.status).toBe(404)
  })

  it('DELETE /:id returns 409 when the patient still has appointments', async () => {
    const res = await request(app).delete('/api/patients/1')
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/still has appointments/)
  })

  it('GET returns the list of patients', async () => {
    const res = await request(app).get('/api/patients')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })

  it('GET ?minAge=40 only returns older patients', async () => {
    const res = await request(app).get('/api/patients?minAge=40')
    expect(res.status).toBe(200)
    expect(res.body.map(p => p.name)).toEqual(['John'])
  })

  it('GET ?minAge=abc returns 400', async () => {
    const res = await request(app).get('/api/patients?minAge=abc')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: true, message: 'minAge must be a number' })
  })

  it('GET /:id returns one patient', async () => {
    const res = await request(app).get('/api/patients/2')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 2, name: 'John', age: 45 })
  })

  it('GET /:id returns 404 for an unknown patient', async () => {
    const res = await request(app).get('/api/patients/999')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Patient not found')
  })

  it('POST creates a patient and returns it with an id', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({ name: 'Marie', age: 29 })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 3, name: 'Marie', age: 29 })

    const list = await request(app).get('/api/patients')
    expect(list.body).toHaveLength(3)
  })

  it('POST with a missing field returns 400', async () => {
    const res = await request(app).post('/api/patients').send({ name: 'NoAge' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
    expect(res.body.message).toMatch(/Missing fields/)
  })

  it('POST with an invalid age returns 400', async () => {
    const res = await request(app).post('/api/patients').send({ name: 'Bob', age: -3 })
    expect(res.status).toBe(400)
  })

  it('POST with a malformed JSON body returns 400', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Content-Type', 'application/json')
      .send('{"name": "broken"')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
  })
})
