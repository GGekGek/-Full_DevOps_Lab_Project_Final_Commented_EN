/**
 * /api/applications — Application Management (SCRUM-8, story SCRUM-42).
 *  GET    /api/applications       → 200 list, filters ?studentId= ?offerId= ?companyId= ?status=
 *  GET    /api/applications/:id   → 200 | 404
 *  POST   /api/applications       → 201 (status "pending") | 400 | 404 student/offer | 409 closed offer / duplicate
 *  PUT    /api/applications/:id   → 200 | 400 | 404   (status pending/accepted/rejected, message)
 *  DELETE /api/applications/:id   → 204 | 404   (the student withdraws)
 * Every application is returned with studentName, offerTitle, companyId and companyName.
 */
import { Router } from 'express'
import {
  listApplications, findApplication, withNames, apply,
  validateApplicationUpdate, updateApplication, deleteApplication
} from '../../utils/applications.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/applications', (req, res) => {
  const { studentId, offerId, companyId, status } = req.query
  res.status(200).json(listApplications({ studentId, offerId, companyId, status }))
})

router.get('/api/applications/:id', (req, res, next) => {
  const application = findApplication(req.params.id)
  if (!application) return next(httpError(404, 'Application not found'))
  res.status(200).json(withNames(application))
})

router.post('/api/applications', (req, res, next) => {
  try {
    res.status(201).json(withNames(apply(req.body)))
  } catch (err) {
    next(err)
  }
})

router.put('/api/applications/:id', (req, res, next) => {
  if (!findApplication(req.params.id)) return next(httpError(404, 'Application not found'))
  const message = validateApplicationUpdate(req.body)
  if (message) return next(httpError(400, message))
  res.status(200).json(withNames(updateApplication(req.params.id, req.body)))
})

router.delete('/api/applications/:id', (req, res, next) => {
  if (!deleteApplication(req.params.id)) return next(httpError(404, 'Application not found'))
  res.status(204).end()
})

export default router
