/**
 * Unit tests for src/utils/appointments.js.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetAppointments, listAppointments, createAppointment,
  findAppointment, updateAppointment, deleteAppointment
} from '../../src/utils/appointments.js'
import { resetDoctors, addDoctor } from '../../src/utils/doctors.js'

/** Runs fn and returns the error it throws (fails the test if it does not throw). */
function errorOf (fn) {
  try {
    fn()
  } catch (err) {
    return err
  }
  throw new Error('expected function to throw')
}

describe('appointments', () => {
  beforeEach(() => {
    resetAppointments()
    resetDoctors()
  })

  it('throws 400 when the body is missing', () => {
    const err = errorOf(() => createAppointment(undefined))
    expect(err.status).toBe(400)
    expect(err.message).toMatch(/Missing required fields/)
  })

  it('throws 400 for an invalid date and 404 for an unknown patient', () => {
    expect(errorOf(() => createAppointment({ doctorId: 1, patientId: 1, date: 'nope' })).status).toBe(400)
    expect(errorOf(() => createAppointment({ doctorId: 1, patientId: 42, date: '2026-12-15' })).status).toBe(404)
  })

  it('creates an appointment with numeric ids and an ISO date', () => {
    const a = createAppointment({ doctorId: '2', patientId: '2', date: '2026-12-20' })
    expect(a).toEqual({ id: 2, doctorId: 2, patientId: 2, date: '2026-12-20T00:00:00.000Z' })
    expect(listAppointments()).toHaveLength(2)
  })

  it('finds an appointment by id with names (DEVOPS-16)', () => {
    expect(findAppointment('1')).toMatchObject({ id: 1, doctor: 'Dr. Sarah Lee', patient: 'Alice' })
    expect(findAppointment(42)).toBeUndefined()
  })

  it('updates only the given fields and validates them (DEVOPS-16)', () => {
    expect(updateAppointment(1, { patientId: '2' })).toMatchObject({ id: 1, doctorId: 1, patientId: 2 })
    expect(errorOf(() => updateAppointment(42, { date: '2026-12-01' })).status).toBe(404)
    expect(errorOf(() => updateAppointment(1, undefined)).status).toBe(400)
    expect(errorOf(() => updateAppointment(1, { date: 'x' })).status).toBe(400)
    expect(errorOf(() => updateAppointment(1, { doctorId: 99 })).message).toBe('Doctor not found')
    expect(errorOf(() => updateAppointment(1, { patientId: 99 })).message).toBe('Patient not found')
  })

  it('deletes an existing appointment only (DEVOPS-16)', () => {
    expect(deleteAppointment(1)).toBe(true)
    expect(listAppointments()).toHaveLength(0)
    expect(deleteAppointment(1)).toBe(false)
  })

  it('returns a null doctor name when the doctor no longer exists', () => {
    const doctor = addDoctor({ name: 'Dr. Temp', specialty: 'Surgery' })
    createAppointment({ doctorId: doctor.id, patientId: 1, date: '2026-12-21' })
    resetDoctors() // Dr. Temp disappears
    const last = listAppointments().at(-1)
    expect(last.doctor).toBeNull()
    expect(last.patient).toBe('Alice')
  })
})
