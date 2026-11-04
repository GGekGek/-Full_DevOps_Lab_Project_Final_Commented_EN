/**
 * Patient management (DEVOPS-9).
 *  GET  /api/patients          → 200, list of patients (optional ?minAge=)
 *  GET  /api/patients/:id      → 200 patient | 404
 *  POST /api/patients          → 201 new patient | 400 invalid body
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import { listPatients, findPatient, validatePatient, addPatient } from '../../utils/patients.js'

const router = Router()

router.get('/api/patients', (req, res, next) => {
  const { minAge } = req.query
  if (minAge === undefined) return res.status(200).json(listPatients())

  const min = Number(minAge)
  if (!Number.isFinite(min)) {
    const err = new Error('minAge must be a number')
    err.status = 400
    return next(err)
  }
  res.status(200).json(listPatients(min))
})

router.get('/api/patients/:id', (req, res, next) => {
  const patient = findPatient(req.params.id)
  if (!patient) {
    const err = new Error('Patient not found')
    err.status = 404
    return next(err)
  }
  res.status(200).json(patient)
})

router.post('/api/patients', (req, res, next) => {
  const message = validatePatient(req.body)
  if (message) {
    const err = new Error(message)
    err.status = 400
    return next(err)
  }
  res.status(201).json(addPatient(req.body))
})

export default router
