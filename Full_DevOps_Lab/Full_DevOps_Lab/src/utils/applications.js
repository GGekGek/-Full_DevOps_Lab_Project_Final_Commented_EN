/**
 * Applications — epic "Application Management" (SCRUM-8), story SCRUM-42.
 * User stories covered: apply for an internship (SCRUM-24), view received
 * applications (SCRUM-25), update an application status (SCRUM-26),
 * view my application status (SCRUM-27).
 *
 * An application links an existing student to an existing offer.
 */
import { createStore } from './store.js'
import { validate, pick } from './validate.js'
import { httpError } from './errorHandler.js'
import { findStudent } from './students.js'
import { findOffer } from './offers.js'
import { findCompany } from './companies.js'

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected']

/** Fields a student sends when applying (the status always starts as "pending"). */
export const APPLY_SCHEMA = {
  studentId: { type: 'id', required: true },
  offerId: { type: 'id', required: true },
  message: { type: 'string' }
}

/** Fields that can change afterwards (the recruiter decides, the student edits the message). */
export const APPLICATION_UPDATE_SCHEMA = {
  status: { type: 'enum', values: APPLICATION_STATUSES },
  message: { type: 'string' }
}

const store = createStore([
  { id: 1, studentId: 1, offerId: 1, status: 'accepted', message: 'Passionate about data visualisation.', appliedAt: '2026-10-25T10:00:00.000Z' },
  { id: 2, studentId: 2, offerId: 2, status: 'pending', message: null, appliedAt: '2026-10-28T14:30:00.000Z' }
])

export const resetApplications = () => store.reset()
export const findApplication = id => store.find(id)

/** Adds student, offer and company names so each view needs a single request. */
export function withNames (application) {
  if (!application) return application
  const student = findStudent(application.studentId)
  const offer = findOffer(application.offerId)
  return {
    ...application,
    studentName: student ? `${student.firstName} ${student.lastName}` : null,
    offerTitle: offer?.title ?? null,
    companyId: offer?.companyId ?? null,
    companyName: offer ? findCompany(offer.companyId)?.name ?? null : null
  }
}

/**
 * Lists applications with optional filters:
 * studentId (student view, SCRUM-27), offerId / companyId (recruiter view, SCRUM-25), status.
 */
export function listApplications ({ studentId, offerId, companyId, status } = {}) {
  return store.list()
    .map(withNames)
    .filter(a =>
      (studentId === undefined || a.studentId === Number(studentId)) &&
      (offerId === undefined || a.offerId === Number(offerId)) &&
      (companyId === undefined || a.companyId === Number(companyId)) &&
      (status === undefined || a.status === status)
    )
}

/**
 * Validates and records an application. Throws an Error with .status
 * 400 (invalid body), 404 (unknown student or offer) or 409 (offer closed / already applied).
 */
export function apply (body) {
  const message = validate(body, APPLY_SCHEMA)
  if (message) throw httpError(400, message)
  const { studentId, offerId, ...rest } = pick(body, APPLY_SCHEMA)
  if (!findStudent(studentId)) throw httpError(404, 'Student not found')
  const offer = findOffer(offerId)
  if (!offer) throw httpError(404, 'Offer not found')
  if (offer.status !== 'open') throw httpError(409, 'This offer is closed')
  if (store.list().some(a => a.studentId === studentId && a.offerId === offerId)) {
    throw httpError(409, 'The student has already applied to this offer')
  }
  return store.add({ studentId, offerId, status: 'pending', message: null, ...rest, appliedAt: new Date().toISOString() })
}

export const validateApplicationUpdate = body => validate(body, APPLICATION_UPDATE_SCHEMA, { partial: true })
export const updateApplication = (id, body) => store.update(id, pick(body, APPLICATION_UPDATE_SCHEMA))
export const deleteApplication = id => store.remove(id)

/** Used to refuse deleting a student or an offer that applications still reference (409). */
export const studentHasApplications = id => store.list().some(a => a.studentId === Number(id))
export const offerHasApplications = id => store.list().some(a => a.offerId === Number(id))
