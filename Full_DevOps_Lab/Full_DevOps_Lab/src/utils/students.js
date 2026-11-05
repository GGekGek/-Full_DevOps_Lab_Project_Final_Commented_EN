/**
 * Students — epic "Student Profile Management" (SCRUM-6), story SCRUM-39.
 * User stories covered: update my profile (SCRUM-16), upload my CV (SCRUM-18),
 * add my skills (SCRUM-19).
 */
import { createStore } from './store.js'
import { validate, pick } from './validate.js'

export const STUDENT_SCHEMA = {
  firstName: { type: 'string', required: true },
  lastName: { type: 'string', required: true },
  email: { type: 'email', required: true },
  program: { type: 'string', required: true },
  skills: { type: 'stringArray' },
  cvUrl: { type: 'url' }
}

const store = createStore([
  { id: 1, firstName: 'Léa', lastName: 'Martin', email: 'lea.martin@edu.devinci.fr', program: 'A4 DIA', skills: ['Python', 'SQL'], cvUrl: 'https://cv.example.com/lea-martin.pdf' },
  { id: 2, firstName: 'Hugo', lastName: 'Bernard', email: 'hugo.bernard@edu.devinci.fr', program: 'A4 OCC', skills: ['JavaScript', 'React'], cvUrl: null },
  { id: 3, firstName: 'Inès', lastName: 'Petit', email: 'ines.petit@edu.devinci.fr', program: 'A4 CCC', skills: ['Java'], cvUrl: null }
])

export const resetStudents = () => store.reset()
export const findStudent = id => store.find(id)

/** All students, optionally filtered by program and/or skill (case-insensitive). */
export function listStudents ({ program, skill } = {}) {
  const same = (a, b) => a.toLowerCase() === b.toLowerCase()
  return store.list().filter(s =>
    (program === undefined || same(s.program, program)) &&
    (skill === undefined || s.skills.some(k => same(k, skill)))
  )
}

/** True if another student already uses this email. */
export function emailTaken (email, exceptId) {
  return store.list().some(s => s.email.toLowerCase() === String(email).toLowerCase() && s.id !== Number(exceptId))
}

export const validateStudent = (body, options) => validate(body, STUDENT_SCHEMA, options)
export const addStudent = body => store.add({ skills: [], cvUrl: null, ...pick(body, STUDENT_SCHEMA) })
export const updateStudent = (id, body) => store.update(id, pick(body, STUDENT_SCHEMA))
export const deleteStudent = id => store.remove(id)
