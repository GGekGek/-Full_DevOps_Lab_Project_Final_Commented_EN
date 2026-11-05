/**
 * Unit tests for src/utils/doctors.js (validation + store).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetDoctors, listDoctors, findDoctor, validateDoctor, addDoctor,
  validateDoctorUpdate, updateDoctor, deleteDoctor
} from '../../src/utils/doctors.js'
import { hasAppointments, resetAppointments } from '../../src/utils/appointments.js'

describe('validateDoctorUpdate', () => {
  it('requires at least one field', () => {
    expect(validateDoctorUpdate(undefined)).toMatch(/at least one field/)
    expect(validateDoctorUpdate({ unknown: 1 })).toMatch(/at least one field/)
  })
  it('rejects an invalid name or specialty', () => {
    expect(validateDoctorUpdate({ name: '' })).toBe('name must be a non-empty string')
    expect(validateDoctorUpdate({ specialty: 3 })).toBe('specialty must be a non-empty string')
  })
  it('accepts a single valid field', () => {
    expect(validateDoctorUpdate({ name: 'Dr. B' })).toBeNull()
    expect(validateDoctorUpdate({ specialty: 'X' })).toBeNull()
  })
})

describe('updateDoctor / deleteDoctor', () => {
  beforeEach(() => resetDoctors())

  it('updates only the given fields and trims them', () => {
    expect(updateDoctor(1, { specialty: ' Oncology ' }))
      .toEqual({ id: 1, name: 'Dr. Sarah Lee', specialty: 'Oncology' })
    expect(updateDoctor(1, { name: ' Dr. S. Lee ' }).name).toBe('Dr. S. Lee')
  })
  it('returns undefined when updating an unknown doctor', () => {
    expect(updateDoctor(99, { name: 'X' })).toBeUndefined()
  })
  it('deletes an existing doctor only', () => {
    expect(deleteDoctor(2)).toBe(true)
    expect(findDoctor(2)).toBeUndefined()
    expect(deleteDoctor(2)).toBe(false)
  })
})

describe('hasAppointments', () => {
  beforeEach(() => resetAppointments())

  it('detects doctors and patients that are booked', () => {
    expect(hasAppointments({ doctorId: 1 })).toBe(true)
    expect(hasAppointments({ doctorId: '2' })).toBe(false)
    expect(hasAppointments({ patientId: 1 })).toBe(true)
    expect(hasAppointments({})).toBe(false)
  })
})

describe('validateDoctor', () => {
  it('rejects a missing body or field', () => {
    expect(validateDoctor(undefined)).toMatch(/Missing required fields/)
    expect(validateDoctor({ name: 'Dr. A' })).toMatch(/Missing required fields/)
  })
  it('rejects an empty or non-string name', () => {
    expect(validateDoctor({ name: ' ', specialty: 'X' })).toBe('name must be a non-empty string')
    expect(validateDoctor({ name: 1, specialty: 'X' })).toBe('name must be a non-empty string')
  })
  it('rejects an empty or non-string specialty', () => {
    expect(validateDoctor({ name: 'Dr. A', specialty: '' })).toBe('specialty must be a non-empty string')
    expect(validateDoctor({ name: 'Dr. A', specialty: 2 })).toBe('specialty must be a non-empty string')
  })
  it('accepts a valid doctor', () => {
    expect(validateDoctor({ name: 'Dr. A', specialty: 'X' })).toBeNull()
  })
})

describe('doctor store', () => {
  beforeEach(() => resetDoctors())

  it('lists all doctors or filters by specialty', () => {
    expect(listDoctors()).toHaveLength(2)
    expect(listDoctors('PEDIATRICS')).toHaveLength(1)
    expect(listDoctors('Dermatology')).toEqual([])
  })
  it('finds a doctor by numeric or string id', () => {
    expect(findDoctor(1).name).toBe('Dr. Sarah Lee')
    expect(findDoctor('2').name).toBe('Dr. Amir Khan')
    expect(findDoctor(99)).toBeUndefined()
  })
  it('adds a doctor with the next id and trimmed fields', () => {
    expect(addDoctor({ name: ' Dr. Lee ', specialty: ' Neurology ' }))
      .toEqual({ id: 3, name: 'Dr. Lee', specialty: 'Neurology' })
  })
})
