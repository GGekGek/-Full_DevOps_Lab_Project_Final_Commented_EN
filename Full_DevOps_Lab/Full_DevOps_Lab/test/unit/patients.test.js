/**
 * Unit tests for src/utils/patients.js (validation + store).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  resetPatients, listPatients, findPatient, validatePatient, addPatient,
  validatePatientUpdate, updatePatient, deletePatient
} from '../../src/utils/patients.js'

describe('validatePatientUpdate', () => {
  it('requires at least one field', () => {
    expect(validatePatientUpdate(undefined)).toMatch(/at least one field/)
    expect(validatePatientUpdate({})).toMatch(/at least one field/)
  })
  it('rejects an invalid name or age', () => {
    expect(validatePatientUpdate({ name: ' ' })).toBe('name must be a non-empty string')
    expect(validatePatientUpdate({ age: -1 })).toMatch(/age must be/)
    expect(validatePatientUpdate({ age: '30' })).toMatch(/age must be/)
  })
  it('accepts a single valid field', () => {
    expect(validatePatientUpdate({ age: 0 })).toBeNull()
    expect(validatePatientUpdate({ name: 'Bob' })).toBeNull()
  })
})

describe('updatePatient / deletePatient', () => {
  beforeEach(() => resetPatients())

  it('updates only the given fields', () => {
    expect(updatePatient(1, { age: 31 })).toEqual({ id: 1, name: 'Alice', age: 31 })
    expect(updatePatient('1', { name: ' Alice M. ' }).name).toBe('Alice M.')
  })
  it('returns undefined when updating an unknown patient', () => {
    expect(updatePatient(42, { age: 1 })).toBeUndefined()
  })
  it('deletes an existing patient only', () => {
    expect(deletePatient(2)).toBe(true)
    expect(findPatient(2)).toBeUndefined()
    expect(deletePatient(2)).toBe(false)
  })
})

describe('validatePatient', () => {
  it('rejects a missing body', () => {
    expect(validatePatient(undefined)).toMatch(/Missing fields/)
  })
  it('rejects a missing age', () => {
    expect(validatePatient({ name: 'A' })).toMatch(/Missing fields/)
  })
  it('rejects an empty name', () => {
    expect(validatePatient({ name: '  ', age: 20 })).toBe('name must be a non-empty string')
  })
  it('rejects a non-string name', () => {
    expect(validatePatient({ name: 42, age: 20 })).toBe('name must be a non-empty string')
  })
  it('rejects a non-integer or out-of-range age', () => {
    expect(validatePatient({ name: 'A', age: '20' })).toMatch(/age must be/)
    expect(validatePatient({ name: 'A', age: 20.5 })).toMatch(/age must be/)
    expect(validatePatient({ name: 'A', age: 151 })).toMatch(/age must be/)
  })
  it('accepts a valid patient', () => {
    expect(validatePatient({ name: 'A', age: 0 })).toBeNull()
  })
})

describe('patient store', () => {
  beforeEach(() => resetPatients())

  it('lists all patients or filters by minAge', () => {
    expect(listPatients()).toHaveLength(2)
    expect(listPatients(30)).toEqual([{ id: 2, name: 'John', age: 45 }])
  })
  it('finds a patient by numeric or string id', () => {
    expect(findPatient(1).name).toBe('Alice')
    expect(findPatient('2').name).toBe('John')
    expect(findPatient(99)).toBeUndefined()
  })
  it('adds a patient with the next id and a trimmed name', () => {
    expect(addPatient({ name: ' Lucas ', age: 52 })).toEqual({ id: 3, name: 'Lucas', age: 52 })
    expect(listPatients()).toHaveLength(3)
  })
})
