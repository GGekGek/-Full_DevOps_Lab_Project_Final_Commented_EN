/**
 * Unit tests for src/utils/doctors.js (validation + store).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetDoctors, listDoctors, findDoctor, validateDoctor, addDoctor
} from '../../src/utils/doctors.js'

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
