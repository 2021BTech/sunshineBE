import { Router } from 'express'
import { createExperience, getExperience } from '../controllers/experienceController'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for create endpoint
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
})

router.post('/', createLimiter, createExperience)
router.get('/:id', getExperience)

export default router