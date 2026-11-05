/**
 * Integration tests for /api/applications (SCRUM-42).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetApplications } from '../src/utils/applications.js'
import { resetOffers } from '../src/utils/offers.js'
import { resetStudents } from '../src/utils/students.js'

describe('/api/applications', () => {
  beforeEach(() => {
    resetApplications()
    resetOffers()
    resetStudents()
  })

  it('GET returns applications with student, offer and company names', async () => {
    const res = await request(app).get('/api/applications')
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({
      id: 1, status: 'accepted', studentName: 'Léa Martin', offerTitle: 'Data Analyst Intern', companyId: 1, companyName: 'DataNova'
    })
  })

  it('GET filters for the student view (SCRUM-27) and the recruiter view (SCRUM-25)', async () => {
    expect((await request(app).get('/api/applications?studentId=2')).body.map(a => a.id)).toEqual([2])
    expect((await request(app).get('/api/applications?companyId=1')).body.map(a => a.id)).toEqual([1])
    expect((await request(app).get('/api/applications?offerId=2&status=pending')).body.map(a => a.id)).toEqual([2])
  })

  it('GET /:id returns one application or 404', async () => {
    expect((await request(app).get('/api/applications/2')).body.studentName).toBe('Hugo Bernard')
    expect((await request(app).get('/api/applications/99')).status).toBe(404)
  })

  it('POST applies to an open offer with status "pending" (SCRUM-24)', async () => {
    const res = await request(app).post('/api/applications').send({ studentId: 3, offerId: 2, message: 'Motivated by DevOps.' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 3, studentId: 3, offerId: 2, status: 'pending', message: 'Motivated by DevOps.', studentName: 'Inès Petit' })
    expect(Number.isNaN(Date.parse(res.body.appliedAt))).toBe(false)
  })

  it('POST returns 400, 404 and 409 when appropriate', async () => {
    expect((await request(app).post('/api/applications').send({ studentId: 3 })).status).toBe(400)
    expect((await request(app).post('/api/applications').send({ studentId: 99, offerId: 2 })).body.message).toBe('Student not found')
    expect((await request(app).post('/api/applications').send({ studentId: 3, offerId: 99 })).body.message).toBe('Offer not found')
    const closed = await request(app).post('/api/applications').send({ studentId: 3, offerId: 3 })
    expect(closed.status).toBe(409)
    expect(closed.body.message).toBe('This offer is closed')
    const twice = await request(app).post('/api/applications').send({ studentId: 2, offerId: 2 })
    expect(twice.status).toBe(409)
  })

  it('PUT lets the recruiter update the status (SCRUM-26)', async () => {
    const res = await request(app).put('/api/applications/2').send({ status: 'rejected' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 2, status: 'rejected', studentId: 2 })
  })

  it('PUT returns 404 or 400, and ignores fields that cannot change', async () => {
    expect((await request(app).put('/api/applications/99').send({ status: 'accepted' })).status).toBe(404)
    expect((await request(app).put('/api/applications/2').send({ status: 'hired' })).status).toBe(400)
    expect((await request(app).put('/api/applications/2').send({ studentId: 1 })).status).toBe(400)
  })

  it('DELETE withdraws an application (204) or returns 404', async () => {
    expect((await request(app).delete('/api/applications/2')).status).toBe(204)
    expect((await request(app).delete('/api/applications/2')).status).toBe(404)
  })

  it('refuses to delete a student or an offer that applications reference (409)', async () => {
    const student = await request(app).delete('/api/students/2')
    expect(student.status).toBe(409)
    expect(student.body.message).toMatch(/still has applications/)
    expect((await request(app).delete('/api/offers/2')).status).toBe(409)

    await request(app).delete('/api/applications/2')
    expect((await request(app).delete('/api/students/2')).status).toBe(204)
    expect((await request(app).delete('/api/offers/2')).status).toBe(204)
  })
})
