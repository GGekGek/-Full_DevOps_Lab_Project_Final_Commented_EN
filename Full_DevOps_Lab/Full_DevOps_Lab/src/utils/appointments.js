/**
 * Appointment store + CRUD logic used by /api/appointments (DEVOPS-11, DEVOPS-16).
 * An appointment links an existing doctor and an existing patient at a date.
 */
import { findDoctor } from './doctors.js'
import { findPatient } from './patients.js'
import { httpError } from './errorHandler.js'

const SEED = [
  { id: 1, doctorId: 1, patientId: 1, date: '2026-12-01T09:00:00.000Z' }
]

let appointments = SEED.map(a => ({ ...a }))

/** Restore the initial data (used by tests to start from a known state). */
export function resetAppointments () {
  appointments = SEED.map(a => ({ ...a }))
}

/** All appointments, with the doctor and patient names resolved. */
export function listAppointments () {
  return appointments.map(a => ({
    ...a,
    doctor: findDoctor(a.doctorId)?.name ?? null,
    patient: findPatient(a.patientId)?.name ?? null
  }))
}

/**
 * True when at least one appointment matches the given doctorId or patientId.
 * Used to refuse deleting a doctor/patient that is still booked (409).
 */
export function hasAppointments ({ doctorId, patientId }) {
  return appointments.some(a =>
    (doctorId !== undefined && a.doctorId === Number(doctorId)) ||
    (patientId !== undefined && a.patientId === Number(patientId))
  )
}

/** One appointment with names resolved, or undefined. */
export function findAppointment (id) {
  return listAppointments().find(a => a.id === Number(id))
}

/**
 * Applies a partial update (PUT) after validating it.
 * Throws an Error with .status 404 (unknown appointment / doctor / patient)
 * or 400 (no field to update / invalid date).
 */
export function updateAppointment (id, body) {
  const appointment = appointments.find(a => a.id === Number(id))
  if (!appointment) throw httpError(404, 'Appointment not found')

  const { doctorId, patientId, date } = body ?? {}
  if (doctorId === undefined && patientId === undefined && date === undefined) {
    throw httpError(400, 'Provide at least one field to update: doctorId, patientId, date')
  }
  if (date !== undefined && Number.isNaN(Date.parse(date))) throw httpError(400, 'date must be a valid date')
  if (doctorId !== undefined && !findDoctor(doctorId)) throw httpError(404, 'Doctor not found')
  if (patientId !== undefined && !findPatient(patientId)) throw httpError(404, 'Patient not found')

  if (doctorId !== undefined) appointment.doctorId = Number(doctorId)
  if (patientId !== undefined) appointment.patientId = Number(patientId)
  if (date !== undefined) appointment.date = new Date(date).toISOString()
  return appointment
}

/** Removes an appointment. Returns true if it existed. */
export function deleteAppointment (id) {
  const index = appointments.findIndex(a => a.id === Number(id))
  if (index === -1) return false
  appointments.splice(index, 1)
  return true
}

/**
 * Validates the body and creates the appointment.
 * Throws an Error with .status 400 (missing field / invalid date)
 * or 404 (unknown doctor / patient).
 */
export function createAppointment (body) {
  const { doctorId, patientId, date } = body ?? {}
  if (!doctorId || !patientId || !date) {
    throw httpError(400, 'Missing required fields: doctorId, patientId and date')
  }
  if (Number.isNaN(Date.parse(date))) throw httpError(400, 'date must be a valid date')
  if (!findDoctor(doctorId)) throw httpError(404, 'Doctor not found')
  if (!findPatient(patientId)) throw httpError(404, 'Patient not found')

  const appointment = {
    id: Math.max(0, ...appointments.map(a => a.id)) + 1,
    doctorId: Number(doctorId),
    patientId: Number(patientId),
    date: new Date(date).toISOString()
  }
  appointments.push(appointment)
  return appointment
}
