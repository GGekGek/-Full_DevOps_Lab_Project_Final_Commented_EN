/**
 * School monitoring — epic "School Monitoring" (SCRUM-10), story SCRUM-43.
 * User stories covered: view students and their internship status (SCRUM-30),
 * identify students without an internship (SCRUM-31).
 *
 * Read-only: the internship status is computed from the applications,
 * so it can never be out of sync with them.
 */
import { listStudents } from './students.js'
import { listApplications } from './applications.js'

export const INTERNSHIP_STATUSES = ['placed', 'applying', 'searching']

/**
 * placed    → at least one accepted application
 * applying  → no accepted application, at least one pending
 * searching → nothing in progress: the school should help this student (SCRUM-31)
 */
export function internshipStatus (applications) {
  if (applications.some(a => a.status === 'accepted')) return 'placed'
  if (applications.some(a => a.status === 'pending')) return 'applying'
  return 'searching'
}

/** Every student with their internship status, optionally filtered by status and/or program. */
export function listStudentStatuses ({ status, program } = {}) {
  return listStudents({ program })
    .map(student => {
      const applications = listApplications({ studentId: student.id })
      const accepted = applications.find(a => a.status === 'accepted')
      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        program: student.program,
        internshipStatus: internshipStatus(applications),
        applications: applications.length,
        internship: accepted ? { offerTitle: accepted.offerTitle, companyName: accepted.companyName } : null
      }
    })
    .filter(s => status === undefined || s.internshipStatus === status)
}
