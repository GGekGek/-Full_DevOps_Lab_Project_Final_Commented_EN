/**
 * Unit tests for src/utils/metrics.js.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getMetrics } from '../../src/utils/metrics.js'
import { resetDoctors } from '../../src/utils/doctors.js'
import { resetPatients } from '../../src/utils/patients.js'
import { resetAppointments } from '../../src/utils/appointments.js'

describe('getMetrics', () => {
  beforeEach(() => {
    resetDoctors()
    resetPatients()
    resetAppointments()
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

  it('counts doctors, patients and appointments', () => {
    expect(getMetrics(1).hospital).toEqual({ doctors: 2, patients: 2, appointments: 1 })
  })

  it('uses the real process uptime by default', () => {
    expect(getMetrics().uptimeSeconds).toBeGreaterThanOrEqual(0)
  })
})
