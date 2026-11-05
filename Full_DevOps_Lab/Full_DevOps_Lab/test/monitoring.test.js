/**
 * Integration and unit tests for /api/monitoring (SCRUM-43).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { internshipStatus } from '../src/utils/monitoring.js'
import { resetStudents } from '../src/utils/students.js'
import { resetApplications } from '../src/utils/applications.js'

describe('internshipStatus', () => {
  it('is placed, applying or searching depending on the applications', () => {
    expect(internshipStatus([{ status: 'rejected' }, { status: 'accepted' }])).toBe('placed')
    expect(internshipStatus([{ status: 'rejected' }, { status: 'pending' }])).toBe('applying')
    expect(internshipStatus([{ status: 'rejected' }])).toBe('searching')
    expect(internshipStatus([])).toBe('searching')
  })
})

describe('GET /api/monitoring/students', () => {
  beforeEach(() => {
    resetStudents()
    resetApplications()
  })

  it('lists every student with their internship status (SCRUM-30)', async () => {
    const res = await request(app).get('/api/monitoring/students')
    expect(res.status).toBe(200)
    expect(res.body.map(s => [s.studentName, s.internshipStatus])).toEqual([
      ['Léa Martin', 'placed'], ['Hugo Bernard', 'applying'], ['Inès Petit', 'searching']
    ])
    expect(res.body[0].internship).toEqual({ offerTitle: 'Data Analyst Intern', companyName: 'DataNova' })
    expect(res.body[2]).toMatchObject({ applications: 0, internship: null })
  })

  it('lists students without an internship (SCRUM-31) and filters by program', async () => {
    expect((await request(app).get('/api/monitoring/students?status=searching')).body.map(s => s.studentId)).toEqual([3])
    expect((await request(app).get('/api/monitoring/students?program=A4 OCC')).body.map(s => s.studentId)).toEqual([2])
  })

  it('updates as soon as an application is accepted', async () => {
    await request(app).put('/api/applications/2').send({ status: 'accepted' })
    const res = await request(app).get('/api/monitoring/students?status=placed')
    expect(res.body.map(s => s.studentId)).toEqual([1, 2])
  })

  it('returns 400 for an unknown status', async () => {
    const res = await request(app).get('/api/monitoring/students?status=hired')
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('status must be one of: placed, applying, searching')
  })
})
