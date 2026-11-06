/**
 * /api/monitoring — School Monitoring (SCRUM-10, story SCRUM-43). Read-only.
 *  GET /api/monitoring/students                    → 200 every student with internshipStatus (SCRUM-30)
 *  GET /api/monitoring/students?status=searching   → 200 students without an internship (SCRUM-31)
 *      also ?program=; 400 if status is not placed / applying / searching
 */
import { Router } from 'express'
import { listStudentStatuses, INTERNSHIP_STATUSES } from '../../utils/monitoring.js'
import { httpError } from '../../utils/errorHandler.js'

const router = Router()

router.get('/api/monitoring/students', (req, res, next) => {
  const { status, program } = req.query
  if (status !== undefined && !INTERNSHIP_STATUSES.includes(status)) {
    return next(httpError(400, `status must be one of: ${INTERNSHIP_STATUSES.join(', ')}`))
  }
  res.status(200).json(listStudentStatuses({ status, program }))
})

export default router
