/**
 * Integration tests for /api/companies (SCRUM-40).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetCompanies } from '../src/utils/companies.js'

const newCompany = { name: 'GreenGrid', sector: 'Energy', city: 'Nantes', contactEmail: 'talent@greengrid.example.com' }

describe('/api/companies', () => {
  beforeEach(() => resetCompanies())

  it('GET returns all companies and filters by city', async () => {
    expect((await request(app).get('/api/companies')).body).toHaveLength(2)
    expect((await request(app).get('/api/companies?city=lyon')).body.map(c => c.name)).toEqual(['CloudWorks'])
  })

  it('GET /:id returns one company or 404', async () => {
    expect((await request(app).get('/api/companies/1')).body.name).toBe('DataNova')
    expect((await request(app).get('/api/companies/99')).status).toBe(404)
  })

  it('POST creates a company profile (SCRUM-32)', async () => {
    const res = await request(app).post('/api/companies').send(newCompany)
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ id: 3, ...newCompany, website: null, contactName: null, contactPhone: null })
  })

  it('POST returns 400 for missing or invalid fields', async () => {
    const missing = await request(app).post('/api/companies').send({ name: 'X' })
    expect(missing.status).toBe(400)
    expect(missing.body.message).toBe('Missing required fields: sector, city, contactEmail')
    const badSite = await request(app).post('/api/companies').send({ ...newCompany, website: 'greengrid' })
    expect(badSite.body.message).toBe('website must be an http(s) URL or null')
  })

  it('PUT updates company information and contacts (SCRUM-33, SCRUM-35)', async () => {
    const res = await request(app).put('/api/companies/2').send({ city: 'Villeurbanne', contactPhone: '+33 4 00 00 00 00' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 2, name: 'CloudWorks', city: 'Villeurbanne', contactPhone: '+33 4 00 00 00 00' })
  })

  it('PUT returns 404 or 400 when appropriate', async () => {
    expect((await request(app).put('/api/companies/99').send({ city: 'X' })).status).toBe(404)
    expect((await request(app).put('/api/companies/1').send({})).status).toBe(400)
    expect((await request(app).put('/api/companies/1').send({ contactEmail: 'bad' })).status).toBe(400)
  })

  it('DELETE removes a company (204) or returns 404', async () => {
    const created = await request(app).post('/api/companies').send(newCompany)
    expect((await request(app).delete(`/api/companies/${created.body.id}`)).status).toBe(204)
    expect((await request(app).delete(`/api/companies/${created.body.id}`)).status).toBe(404)
  })
})
