/**
 * Patient management (DEVOPS-9, CRUD completed in DEVOPS-15).
 *  GET    /api/patients         → 200, list of patients (optional ?minAge=)
 *  GET    /api/patients/:id     → 200 patient | 404
 *  POST   /api/patients         → 201 new patient | 400 invalid body
 *  PUT    /api/patients/:id     → 200 updated patient | 400 invalid body | 404
 *  DELETE /api/patients/:id     → 204 | 404 | 409 patient still has appointments
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import {
  listPatients, findPatient, validatePatient, addPatient,
  validatePatientUpdate, updatePatient, deletePatient
} from '../../utils/patients.js'
import { hasAppointments } from '../../utils/appointments.js'
import { httpError } from '../../utils/errorHandler.js'

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

router.put('/api/patients/:id', (req, res, next) => {
  if (!findPatient(req.params.id)) return next(httpError(404, 'Patient not found'))
  const message = validatePatientUpdate(req.body)
  if (message) return next(httpError(400, message))
  res.status(200).json(updatePatient(req.params.id, req.body))
})

router.delete('/api/patients/:id', (req, res, next) => {
  if (!findPatient(req.params.id)) return next(httpError(404, 'Patient not found'))
  if (hasAppointments({ patientId: req.params.id })) {
    return next(httpError(409, 'Patient still has appointments; delete them first'))
  }
  deletePatient(req.params.id)
  res.status(204).end()
})

export default router
