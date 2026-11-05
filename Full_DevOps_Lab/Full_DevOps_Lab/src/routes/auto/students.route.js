/**
 * /api/students — Student Profile Management (SCRUM-6, story SCRUM-39).
 *  GET    /api/students        → 200 list (filters ?program= & ?skill=)
 *  GET    /api/students/:id    → 200 | 404
 *  POST   /api/students        → 201 | 400 invalid body | 409 email already used
 *  PUT    /api/students/:id    → 200 | 400 | 404 | 409   (profile, skills, CV)
 *  DELETE /api/students/:id    → 204 | 404 | 409 student still has applications (SCRUM-42)
 */
import { Router } from 'express'
import {
  listStudents, findStudent, validateStudent, emailTaken,
  addStudent, updateStudent, deleteStudent
} from '../../utils/students.js'
import { studentHasApplications } from '../../utils/applications.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/students', (req, res) => {
  const { program, skill } = req.query
  res.status(200).json(listStudents({ program, skill }))
})

router.get('/api/students/:id', (req, res, next) => {
  const student = findStudent(req.params.id)
  if (!student) return next(httpError(404, 'Student not found'))
  res.status(200).json(student)
})

router.post('/api/students', (req, res, next) => {
  const message = validateStudent(req.body)
  if (message) return next(httpError(400, message))
  if (emailTaken(req.body.email)) return next(httpError(409, 'A student with this email already exists'))
  res.status(201).json(addStudent(req.body))
})

router.put('/api/students/:id', (req, res, next) => {
  if (!findStudent(req.params.id)) return next(httpError(404, 'Student not found'))
  const message = validateStudent(req.body, { partial: true })
  if (message) return next(httpError(400, message))
  if (req.body.email !== undefined && emailTaken(req.body.email, req.params.id)) {
    return next(httpError(409, 'A student with this email already exists'))
  }
  res.status(200).json(updateStudent(req.params.id, req.body))
})

router.delete('/api/students/:id', (req, res, next) => {
  if (!findStudent(req.params.id)) return next(httpError(404, 'Student not found'))
  if (studentHasApplications(req.params.id)) {
    return next(httpError(409, 'Student still has applications; withdraw them first'))
  }
  deleteStudent(req.params.id)
  res.status(204).end()
})

export default router
