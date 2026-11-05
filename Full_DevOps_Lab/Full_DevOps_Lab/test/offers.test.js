/**
 * Integration tests for /api/offers and /api/companies/:id/offers (SCRUM-41).
 */
import request from 'supertest'
import app from '../src/app.js'
import { describe, it, expect, beforeEach } from 'vitest'
import { resetOffers } from '../src/utils/offers.js'
import { resetCompanies } from '../src/utils/companies.js'

const newOffer = { companyId: 2, title: 'Cloud Security Intern', field: 'Cloud', location: 'Lyon', durationWeeks: 24 }

describe('/api/offers', () => {
  beforeEach(() => {
    resetOffers()
    resetCompanies()
  })

  it('GET returns all offers with their company name', async () => {
    const res = await request(app).get('/api/offers')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
    expect(res.body[0]).toMatchObject({ id: 1, companyName: 'DataNova' })
  })

  it('GET searches in title and description (SCRUM-22)', async () => {
    const res = await request(app).get('/api/offers?q=pipelines')
    expect(res.body.map(o => o.title)).toEqual(['DevOps Engineer Intern'])
  })

  it('GET filters by location, field and status (SCRUM-23)', async () => {
    expect((await request(app).get('/api/offers?location=paris')).body).toHaveLength(2)
    expect((await request(app).get('/api/offers?location=paris&status=open')).body.map(o => o.id)).toEqual([1])
    expect((await request(app).get('/api/offers?field=ai')).body.map(o => o.id)).toEqual([3])
    expect((await request(app).get('/api/offers?companyId=2')).body.map(o => o.id)).toEqual([2])
  })

  it('GET /:id returns one offer or 404', async () => {
    expect((await request(app).get('/api/offers/2')).body).toMatchObject({ title: 'DevOps Engineer Intern', companyName: 'CloudWorks' })
    expect((await request(app).get('/api/offers/99')).status).toBe(404)
  })

  it('POST creates an open offer published today (SCRUM-20)', async () => {
    const res = await request(app).post('/api/offers').send(newOffer)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 4, ...newOffer, status: 'open', description: null, companyName: 'CloudWorks' })
    expect(res.body.publishedAt).toBe(new Date().toISOString().slice(0, 10))
  })

  it('POST returns 400 for invalid fields and 404 for an unknown company', async () => {
    expect((await request(app).post('/api/offers').send({ title: 'X' })).status).toBe(400)
    const weeks = await request(app).post('/api/offers').send({ ...newOffer, durationWeeks: 80 })
    expect(weeks.body.message).toBe('durationWeeks must be an integer between 1 and 52')
    const company = await request(app).post('/api/offers').send({ ...newOffer, companyId: 99 })
    expect(company.status).toBe(404)
    expect(company.body.message).toBe('Company not found')
  })

  it('PUT edits or closes an offer (SCRUM-21)', async () => {
    const res = await request(app).put('/api/offers/1').send({ status: 'closed', durationWeeks: 26 })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, status: 'closed', durationWeeks: 26, title: 'Data Analyst Intern' })
  })

  it('PUT returns 404, 400 or 404 (company) when appropriate', async () => {
    expect((await request(app).put('/api/offers/99').send({ title: 'X' })).status).toBe(404)
    expect((await request(app).put('/api/offers/1').send({ status: 'draft' })).status).toBe(400)
    expect((await request(app).put('/api/offers/1').send({ companyId: 99 })).body.message).toBe('Company not found')
  })

  it('DELETE removes an offer (204) or returns 404', async () => {
    expect((await request(app).delete('/api/offers/3')).status).toBe(204)
    expect((await request(app).delete('/api/offers/3')).status).toBe(404)
  })
})

describe('/api/companies/:id/offers and company deletion', () => {
  beforeEach(() => {
    resetOffers()
    resetCompanies()
  })

  it('lists the offers published by one company (SCRUM-34)', async () => {
    const res = await request(app).get('/api/companies/1/offers')
    expect(res.status).toBe(200)
    expect(res.body.map(o => o.id)).toEqual([1, 3])
    expect((await request(app).get('/api/companies/99/offers')).status).toBe(404)
  })

  it('refuses to delete a company that still has offers (409)', async () => {
    const res = await request(app).delete('/api/companies/2')
    expect(res.status).toBe(409)
    await request(app).delete('/api/offers/2')
    expect((await request(app).delete('/api/companies/2')).status).toBe(204)
  })
})
