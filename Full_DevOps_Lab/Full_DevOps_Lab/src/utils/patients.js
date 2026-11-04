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

/** Adds a patient and returns it with its new id (highest id + 1). */
export function addPatient ({ name, age }) {
  const id = Math.max(0, ...patients.map(p => p.id)) + 1
  const patient = { id, name: name.trim(), age }
  patients.push(patient)
  return patient
}
