/**
 * /api/offers — Internship Offer Management (SCRUM-7, story SCRUM-41).
 *  GET    /api/offers           → 200 list, search ?q= and filters ?location= ?field= ?status= ?companyId=
 *  GET    /api/offers/:id       → 200 | 404
 *  POST   /api/offers           → 201 | 400 invalid body | 404 unknown company
 *  PUT    /api/offers/:id       → 200 | 400 | 404   (edit, or close with { "status": "closed" })
 *  DELETE /api/offers/:id       → 204 | 404
 * Every offer is returned with its companyName.
 */
import { Router } from 'express'
import {
  listOffers, findOffer, withCompany, validateOffer,
  addOffer, updateOffer, deleteOffer
} from '../../utils/offers.js'
import { findCompany } from '../../utils/companies.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/offers', (req, res) => {
  const { q, location, field, status, companyId } = req.query
  res.status(200).json(listOffers({ q, location, field, status, companyId }))
})

router.get('/api/offers/:id', (req, res, next) => {
  const offer = findOffer(req.params.id)
  if (!offer) return next(httpError(404, 'Offer not found'))
  res.status(200).json(withCompany(offer))
})

router.post('/api/offers', (req, res, next) => {
  const message = validateOffer(req.body)
  if (message) return next(httpError(400, message))
  if (!findCompany(req.body.companyId)) return next(httpError(404, 'Company not found'))
  res.status(201).json(withCompany(addOffer(req.body)))
})

router.put('/api/offers/:id', (req, res, next) => {
  if (!findOffer(req.params.id)) return next(httpError(404, 'Offer not found'))
  const message = validateOffer(req.body, { partial: true })
  if (message) return next(httpError(400, message))
  if (req.body.companyId !== undefined && !findCompany(req.body.companyId)) {
    return next(httpError(404, 'Company not found'))
  }
  res.status(200).json(withCompany(updateOffer(req.params.id, req.body)))
})

router.delete('/api/offers/:id', (req, res, next) => {
  if (!deleteOffer(req.params.id)) return next(httpError(404, 'Offer not found'))
  res.status(204).end()
})

export default router
