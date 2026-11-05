/**
 * Appointments (DEVOPS-11, CRUD completed in DEVOPS-16): visits between a doctor and a patient.
 *  GET    /api/appointments       → 200, list with doctor & patient names
 *  GET    /api/appointments/:id   → 200 appointment with names | 404
 *  POST   /api/appointments       → 201 | 400 missing field / bad date | 404 unknown doctor or patient
 *  PUT    /api/appointments/:id   → 200 | 400 no field / bad date | 404 unknown appointment, doctor or patient
 *  DELETE /api/appointments/:id   → 204 | 404
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import {
  listAppointments, createAppointment,
  findAppointment, updateAppointment, deleteAppointment
} from '../../utils/appointments.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/appointments', (_req, res) => {
  res.status(200).json(listAppointments())
})

router.get('/api/appointments/:id', (req, res, next) => {
  const appointment = findAppointment(req.params.id)
  if (!appointment) return next(httpError(404, 'Appointment not found'))
  res.status(200).json(appointment)
})

router.post('/api/appointments', (req, res, next) => {
  try {
    res.status(201).json(createAppointment(req.body))
  } catch (err) {
    next(err)
  }
})

router.put('/api/appointments/:id', (req, res, next) => {
  try {
    res.status(200).json(updateAppointment(req.params.id, req.body))
  } catch (err) {
    next(err)
  }
})

router.delete('/api/appointments/:id', (req, res, next) => {
  if (!deleteAppointment(req.params.id)) return next(httpError(404, 'Appointment not found'))
  res.status(204).end()
})

export default router
