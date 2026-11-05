/**
 * Patient store + validation helpers used by /api/patients (DEVOPS-9).
 * Data is kept in memory for now; the route only depends on these
 * functions, so they can later be backed by MongoDB without changing it.
 */

const SEED = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'John', age: 45 }
]

let patients = SEED.map(p => ({ ...p }))

/** Restore the initial data (used by tests to start from a known state). */
export function resetPatients () {
  patients = SEED.map(p => ({ ...p }))
}

/** All patients, or only those strictly older than `minAge` when given. */
export function listPatients (minAge) {
  if (minAge === undefined) return patients
  return patients.filter(p => p.age > minAge)
}

/** One patient by id, or undefined. */
export function findPatient (id) {
  return patients.find(p => p.id === Number(id))
}

/**
 * Returns an error message for an invalid body, or null when it is valid.
 * Rules: name is a non-empty string, age is an integer between 0 and 150.
 */
export function validatePatient (body) {
  const { name, age } = body ?? {}
  if (name === undefined || age === undefined) return 'Missing fields: name and age are required'
  if (typeof name !== 'string' || name.trim() === '') return 'name must be a non-empty string'
  if (!Number.isInteger(age) || age < 0 || age > 150) return 'age must be an integer between 0 and 150'
  return null
}

/**
 * Validates a partial update (PUT). Returns an error message or null.
 * At least one of name / age must be sent, and each sent field must be valid.
 */
export function validatePatientUpdate (body) {
  const { name, age } = body ?? {}
  if (name === undefined && age === undefined) return 'Provide at least one field to update: name, age'
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) return 'name must be a non-empty string'
  if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 150)) return 'age must be an integer between 0 and 150'
  return null
}

/** Applies a (validated) partial update. Returns the patient, or undefined if not found. */
export function updatePatient (id, { name, age }) {
  const patient = findPatient(id)
  if (!patient) return undefined
  if (name !== undefined) patient.name = name.trim()
  if (age !== undefined) patient.age = age
  return patient
}

/** Removes a patient. Returns true if it existed. */
export function deletePatient (id) {
  const index = patients.findIndex(p => p.id === Number(id))
  if (index === -1) return false
  patients.splice(index, 1)
  return true
}

/** Adds a patient and returns it with its new id (highest id + 1). */
export function addPatient ({ name, age }) {
  const id = Math.max(0, ...patients.map(p => p.id)) + 1
  const patient = { id, name: name.trim(), age }
  patients.push(patient)
  return patient
}
