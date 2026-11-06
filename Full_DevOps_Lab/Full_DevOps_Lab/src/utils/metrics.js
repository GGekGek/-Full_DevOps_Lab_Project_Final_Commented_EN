/**
 * Builds the /api/metrics payload (DEVOPS-12, adapted to the Internship Application in SCRUM-43).
 * System stats + a status label from formatStatus (DEVOPS-8) + platform counts.
 */
import { formatStatus } from './status.js'
import { listStudents } from './students.js'
import { listCompanies } from './companies.js'
import { listOffers } from './offers.js'
import { listApplications } from './applications.js'
import { listStudentStatuses } from './monitoring.js'

const countBy = (items, key, values) =>
  Object.fromEntries(values.map(value => [value, items.filter(item => item[key] === value).length]))

/** `uptimeSec` and `now` are parameters so unit tests can control them. */
export function getMetrics (uptimeSec = process.uptime(), now = new Date()) {
  return {
    status: formatStatus(uptimeSec),
    uptimeSeconds: Math.round(uptimeSec),
    memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    node: process.version,
    timestamp: now.toISOString(),
    platform: {
      students: listStudents().length,
      studentsWithoutInternship: listStudentStatuses({ status: 'searching' }).length,
      companies: listCompanies().length,
      offers: countBy(listOffers(), 'status', ['open', 'closed']),
      applications: countBy(listApplications(), 'status', ['pending', 'accepted', 'rejected'])
    }
  }
}
