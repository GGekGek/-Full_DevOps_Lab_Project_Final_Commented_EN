/**
 * /api/companies — Company Management (SCRUM-11, story SCRUM-40).
 *  GET    /api/companies        → 200 list (filter ?city=)
 *  GET    /api/companies/:id    → 200 | 404
 *  POST   /api/companies        → 201 | 400 invalid body
 *  PUT    /api/companies/:id    → 200 | 400 | 404   (company info, contacts)
 *  DELETE /api/companies/:id    → 204 | 404 | 409 company still has offers (SCRUM-41)
 *  GET    /api/companies/:id/offers → 200 offers of this company (SCRUM-34) | 404
 */
import { Router } from 'express'
import {
  listCompanies, findCompany, validateCompany,
  addCompany, updateCompany, deleteCompany
} from '../../utils/companies.js'
import { listOffers, companyHasOffers } from '../../utils/offers.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/companies', (req, res) => {
  res.status(200).json(listCompanies({ city: req.query.city }))
})

router.get('/api/companies/:id', (req, res, next) => {
  const company = findCompany(req.params.id)
  if (!company) return next(httpError(404, 'Company not found'))
  res.status(200).json(company)
})

router.post('/api/companies', (req, res, next) => {
  const message = validateCompany(req.body)
  if (message) return next(httpError(400, message))
  res.status(201).json(addCompany(req.body))
})

router.put('/api/companies/:id', (req, res, next) => {
  if (!findCompany(req.params.id)) return next(httpError(404, 'Company not found'))
  const message = validateCompany(req.body, { partial: true })
  if (message) return next(httpError(400, message))
  res.status(200).json(updateCompany(req.params.id, req.body))
})

router.get('/api/companies/:id/offers', (req, res, next) => {
  if (!findCompany(req.params.id)) return next(httpError(404, 'Company not found'))
  res.status(200).json(listOffers({ companyId: req.params.id }))
})

router.delete('/api/companies/:id', (req, res, next) => {
  if (!findCompany(req.params.id)) return next(httpError(404, 'Company not found'))
  if (companyHasOffers(req.params.id)) {
    return next(httpError(409, 'Company still has internship offers; delete them first'))
  }
  deleteCompany(req.params.id)
  res.status(204).end()
})

export default router
