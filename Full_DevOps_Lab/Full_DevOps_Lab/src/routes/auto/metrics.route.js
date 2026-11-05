/**
 * GET /api/metrics → system and platform stats (DEVOPS-12, adapted in SCRUM-43).
 * Returns: { status, uptimeSeconds, memoryMB, node, timestamp,
 *            platform: { students, studentsWithoutInternship, companies,
 *                        offers: { open, closed }, applications: { pending, accepted, rejected } } }
 */
import { Router } from 'express'
import { getMetrics } from '../../utils/metrics.js'

const router = Router()

router.get('/api/metrics', (_req, res) => {
  res.status(200).json(getMetrics())
})

export default router
