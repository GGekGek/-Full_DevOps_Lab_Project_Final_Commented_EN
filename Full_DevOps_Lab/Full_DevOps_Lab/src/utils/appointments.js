/**
 * Appointment store + creation logic used by /api/appointments (DEVOPS-11).
 * An appointment links an existing doctor and an existing patient at a date.
 */
import { findDoctor } from './doctors.js'
import { findPatient } from './patients.js'

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

function httpError (status, message) {
  const err = new Error(message)
  err.status = status
  return err
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
