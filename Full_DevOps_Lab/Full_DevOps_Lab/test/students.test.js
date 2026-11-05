/**
 * Integration tests for /api/students (SCRUM-39).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetStudents } from '../src/utils/students.js'

const newStudent = { firstName: 'Nora', lastName: 'Diallo', email: 'nora.diallo@edu.devinci.fr', program: 'A4 DIA' }

describe('/api/students', () => {
  beforeEach(() => resetStudents())

  it('GET returns all students', async () => {
    const res = await request(app).get('/api/students')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it('GET filters by program and by skill (case-insensitive)', async () => {
    expect((await request(app).get('/api/students?program=a4 dia')).body.map(s => s.firstName)).toEqual(['Léa'])
    expect((await request(app).get('/api/students?skill=react')).body.map(s => s.firstName)).toEqual(['Hugo'])
  })

  it('GET /:id returns one student or 404', async () => {
    expect((await request(app).get('/api/students/1')).body.lastName).toBe('Martin')
    const missing = await request(app).get('/api/students/99')
    expect(missing.status).toBe(404)
    expect(missing.body).toEqual({ error: true, message: 'Student not found' })
  })

  it('POST creates a student with empty skills and no CV by default', async () => {
    const res = await request(app).post('/api/students').send(newStudent)
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 4, ...newStudent, skills: [], cvUrl: null })
  })

  it('POST returns 400 for missing or invalid fields', async () => {
    const missing = await request(app).post('/api/students').send({ firstName: 'Nora' })
    expect(missing.status).toBe(400)
    expect(missing.body.message).toBe('Missing required fields: lastName, email, program')
    const badEmail = await request(app).post('/api/students').send({ ...newStudent, email: 'nora' })
    expect(badEmail.body.message).toBe('email must be a valid email address')
  })

  it('POST returns 409 when the email is already used', async () => {
    const res = await request(app).post('/api/students').send({ ...newStudent, email: 'LEA.MARTIN@edu.devinci.fr' })
    expect(res.status).toBe(409)
  })

  it('PUT updates skills and CV (SCRUM-18, SCRUM-19)', async () => {
    const res = await request(app).put('/api/students/2')
      .send({ skills: ['JavaScript', 'React', 'Node.js'], cvUrl: 'https://cv.example.com/hugo.pdf' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 2, skills: ['JavaScript', 'React', 'Node.js'], cvUrl: 'https://cv.example.com/hugo.pdf' })
  })

  it('PUT returns 404, 400 and 409 when appropriate', async () => {
    expect((await request(app).put('/api/students/99').send({ program: 'X' })).status).toBe(404)
    expect((await request(app).put('/api/students/1').send({})).status).toBe(400)
    expect((await request(app).put('/api/students/1').send({ skills: 'Python' })).status).toBe(400)
    expect((await request(app).put('/api/students/1').send({ email: 'hugo.bernard@edu.devinci.fr' })).status).toBe(409)
    expect((await request(app).put('/api/students/1').send({ email: 'lea.martin@edu.devinci.fr' })).status).toBe(200)
  })

  it('DELETE removes a student (204) or returns 404', async () => {
    expect((await request(app).delete('/api/students/3')).status).toBe(204)
    expect((await request(app).get('/api/students/3')).status).toBe(404)
    expect((await request(app).delete('/api/students/3')).status).toBe(404)
  })
})
