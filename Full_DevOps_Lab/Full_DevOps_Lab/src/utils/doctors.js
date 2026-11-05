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

/**
 * Validates a partial update (PUT). Returns an error message or null.
 * At least one of name / specialty must be sent, and each sent field must be valid.
 */
export function validateDoctorUpdate (body) {
  const { name, specialty } = body ?? {}
  if (name === undefined && specialty === undefined) {
    return 'Provide at least one field to update: name, specialty'
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) return 'name must be a non-empty string'
  if (specialty !== undefined && (typeof specialty !== 'string' || specialty.trim() === '')) return 'specialty must be a non-empty string'
  return null
}

/** Applies a (validated) partial update. Returns the doctor, or undefined if not found. */
export function updateDoctor (id, { name, specialty }) {
  const doctor = findDoctor(id)
  if (!doctor) return undefined
  if (name !== undefined) doctor.name = name.trim()
  if (specialty !== undefined) doctor.specialty = specialty.trim()
  return doctor
}

/** Removes a doctor. Returns true if it existed. */
export function deleteDoctor (id) {
  const index = doctors.findIndex(d => d.id === Number(id))
  if (index === -1) return false
  doctors.splice(index, 1)
  return true
}

/** Adds a doctor and returns it with its new id (highest id + 1). */
export function addDoctor ({ name, specialty }) {
  const id = Math.max(0, ...doctors.map(d => d.id)) + 1
  const doctor = { id, name: name.trim(), specialty: specialty.trim() }
  doctors.push(doctor)
  return doctor
}
