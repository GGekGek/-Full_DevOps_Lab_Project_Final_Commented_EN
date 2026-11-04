/**
 * Appointments (DEVOPS-11): schedule visits between a doctor and a patient.
 *  GET  /api/appointments      → 200, list with doctor & patient names
 *  POST /api/appointments      → 201 | 400 missing field / bad date | 404 unknown doctor or patient
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import { listAppointments, createAppointment } from '../../utils/appointments.js'

const router = Router()

router.get('/api/appointments', (_req, res) => {
  res.status(200).json(listAppointments())
})

router.post('/api/appointments', (req, res, next) => {
  try {
    res.status(201).json(createAppointment(req.body))
  } catch (err) {
    next(err)
  }
})

export default router
