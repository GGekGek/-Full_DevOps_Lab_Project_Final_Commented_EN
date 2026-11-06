/**
 * Unit tests for src/utils/metrics.js.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getMetrics } from '../../src/utils/metrics.js'
import { resetStudents } from '../../src/utils/students.js'
import { resetCompanies } from '../../src/utils/companies.js'
import { resetOffers } from '../../src/utils/offers.js'
import { resetApplications } from '../../src/utils/applications.js'

describe('getMetrics', () => {
  beforeEach(() => {
    resetStudents()
    resetCompanies()
    resetOffers()
    resetApplications()
  })

  it('labels the status from the uptime (formatStatus)', () => {
    expect(getMetrics(10).status).toBe('warming-up')
    expect(getMetrics(120).status).toBe('healthy')
    expect(getMetrics(7200).status).toBe('steady')
  })

  it('rounds uptime and uses the given timestamp', () => {
    const m = getMetrics(61.7, new Date('2026-11-04T12:00:00Z'))
    expect(m.uptimeSeconds).toBe(62)
    expect(m.timestamp).toBe('2026-11-04T12:00:00.000Z')
  })

  it('counts students, companies, offers and applications (SCRUM-43)', () => {
    expect(getMetrics(1).platform).toEqual({
      students: 3,
      studentsWithoutInternship: 1,
      companies: 2,
      offers: { open: 2, closed: 1 },
      applications: { pending: 1, accepted: 1, rejected: 0 }
    })
  })

  it('uses the real process uptime by default', () => {
    expect(getMetrics().uptimeSeconds).toBeGreaterThanOrEqual(0)
  })
})
