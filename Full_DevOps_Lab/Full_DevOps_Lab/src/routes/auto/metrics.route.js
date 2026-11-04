/**
 * GET /api/metrics → system and hospital stats (DEVOPS-12).
 * Returns: { status, uptimeSeconds, memoryMB, node, timestamp,
 *            hospital: { doctors, patients, appointments } }
 */
import { Router } from 'express'
import { getMetrics } from '../../utils/metrics.js'

const router = Router()

router.get('/api/metrics', (_req, res) => {
  res.status(200).json(getMetrics())
})

export default router
