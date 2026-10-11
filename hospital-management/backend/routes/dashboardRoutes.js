import { Router } from 'express'
import pool from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ patients }]] = await pool.query('SELECT COUNT(*) AS patients FROM patients')
    const [[{ doctors }]] = await pool.query('SELECT COUNT(*) AS doctors FROM doctors')
    const [[{ appointmentsToday }]] = await pool.query(
      `SELECT COUNT(*) AS appointmentsToday FROM appointments WHERE DATE(appointment_date) = CURDATE()`
    )
    const [[{ pendingBills }]] = await pool.query(
      `SELECT COUNT(*) AS pendingBills FROM bills WHERE status = 'pending'`
    )

    const [trendRows] = await pool.query(
      `SELECT DATE_FORMAT(appointment_date, '%a') AS day, COUNT(*) AS appointments
       FROM appointments
       WHERE appointment_date >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(appointment_date)
       ORDER BY DATE(appointment_date)`
    )

    res.json({
      stats: { patients, doctors, appointmentsToday, pendingBills },
      trend: trendRows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load dashboard stats' })
  }
})

export default router
