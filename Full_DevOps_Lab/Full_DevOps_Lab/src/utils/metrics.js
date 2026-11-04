/**
 * Builds the /api/metrics payload (DEVOPS-12).
 * System stats + a status label from formatStatus (DEVOPS-8) + hospital counts.
 */
import { formatStatus } from './status.js'
import { listDoctors } from './doctors.js'
import { listPatients } from './patients.js'
import { listAppointments } from './appointments.js'

/** `uptimeSec` and `now` are parameters so unit tests can control them. */
export function getMetrics (uptimeSec = process.uptime(), now = new Date()) {
  return {
    status: formatStatus(uptimeSec),
    uptimeSeconds: Math.round(uptimeSec),
    memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    node: process.version,
    timestamp: now.toISOString(),
    hospital: {
      doctors: listDoctors().length,
      patients: listPatients().length,
      appointments: listAppointments().length
    }
  }
}
