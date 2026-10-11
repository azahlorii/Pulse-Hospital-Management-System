import { Router } from 'express'
import { login, register, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', register) // lock this down or remove in production; useful for seeding the first admin
router.get('/me', requireAuth, me)

export default router
