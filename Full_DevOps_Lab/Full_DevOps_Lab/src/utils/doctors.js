/**
 * Doctor store + validation helpers used by /api/doctors (DEVOPS-10).
 * Data is kept in memory for now; the route only depends on these
 * functions, so they can later be backed by MongoDB without changing it.
 */

const SEED = [
  { id: 1, name: 'Dr. Sarah Lee', specialty: 'Cardiology' },
  { id: 2, name: 'Dr. Amir Khan', specialty: 'Pediatrics' }
]

let doctors = SEED.map(d => ({ ...d }))

/** Restore the initial data (used by tests to start from a known state). */
export function resetDoctors () {
  doctors = SEED.map(d => ({ ...d }))
}

/** All doctors, or only those of a given specialty (case-insensitive). */
export function listDoctors (specialty) {
  if (specialty === undefined) return doctors
  return doctors.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase())
}

/** One doctor by id, or undefined. */
export function findDoctor (id) {
  return doctors.find(d => d.id === Number(id))
}

/**
 * Returns an error message for an invalid body, or null when it is valid.
 * Rules: name and specialty are non-empty strings.
 */
export function validateDoctor (body) {
  const { name, specialty } = body ?? {}
  if (name === undefined || specialty === undefined) return 'Missing required fields: name and specialty'
  if (typeof name !== 'string' || name.trim() === '') return 'name must be a non-empty string'
  if (typeof specialty !== 'string' || specialty.trim() === '') return 'specialty must be a non-empty string'
  return null
}

/** Adds a doctor and returns it with its new id (highest id + 1). */
export function addDoctor ({ name, specialty }) {
  const id = Math.max(0, ...doctors.map(d => d.id)) + 1
  const doctor = { id, name: name.trim(), specialty: specialty.trim() }
  doctors.push(doctor)
  return doctor
}
