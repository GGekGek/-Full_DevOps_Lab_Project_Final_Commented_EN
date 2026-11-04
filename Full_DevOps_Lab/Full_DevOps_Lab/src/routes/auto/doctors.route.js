/**
 * Doctor management (DEVOPS-10).
 *  GET  /api/doctors           → 200, list of doctors (optional ?specialty=)
 *  GET  /api/doctors/:id       → 200 doctor | 404
 *  POST /api/doctors           → 201 new doctor | 400 invalid body
 * Errors go through the global error handler: { error: true, message }.
 */
import { Router } from 'express'
import { listDoctors, findDoctor, validateDoctor, addDoctor } from '../../utils/doctors.js'

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

export default router
