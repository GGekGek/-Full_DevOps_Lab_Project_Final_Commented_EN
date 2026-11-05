/**
 * Doctor management (DEVOPS-10, CRUD completed in DEVOPS-14).
 *  GET    /api/doctors          → 200, list of doctors (optional ?specialty=)
 *  GET    /api/doctors/:id      → 200 doctor | 404
 *  POST   /api/doctors          → 201 new doctor | 400 invalid body
 *  PUT    /api/doctors/:id      → 200 updated doctor | 400 invalid body | 404
 *  DELETE /api/doctors/:id      → 204 | 404 | 409 doctor still has appointments
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import {
  listDoctors, findDoctor, validateDoctor, addDoctor,
  validateDoctorUpdate, updateDoctor, deleteDoctor
} from '../../utils/doctors.js'
import { hasAppointments } from '../../utils/appointments.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/doctors', (req, res) => {
  res.status(200).json(listDoctors(req.query.specialty))
})

router.get('/api/doctors/:id', (req, res, next) => {
  const doctor = findDoctor(req.params.id)
  if (!doctor) {
    const err = new Error('Doctor not found')
    err.status = 404
    return next(err)
  }
  res.status(200).json(doctor)
})

router.post('/api/doctors', (req, res, next) => {
  const message = validateDoctor(req.body)
  if (message) {
    const err = new Error(message)
    err.status = 400
    return next(err)
  }
  res.status(201).json(addDoctor(req.body))
})

router.put('/api/doctors/:id', (req, res, next) => {
  if (!findDoctor(req.params.id)) return next(httpError(404, 'Doctor not found'))
  const message = validateDoctorUpdate(req.body)
  if (message) return next(httpError(400, message))
  res.status(200).json(updateDoctor(req.params.id, req.body))
})

router.delete('/api/doctors/:id', (req, res, next) => {
  if (!findDoctor(req.params.id)) return next(httpError(404, 'Doctor not found'))
  if (hasAppointments({ doctorId: req.params.id })) {
    return next(httpError(409, 'Doctor still has appointments; delete or reassign them first'))
  }
  deleteDoctor(req.params.id)
  res.status(204).end()
})

export default router
