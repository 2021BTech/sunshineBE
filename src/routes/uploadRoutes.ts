import { Router } from 'express'
import { uploadAudio } from '../controllers/uploadController'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20 // limit each IP to 20 uploads per hour
})

router.post('/audio', uploadLimiter, uploadAudio)

export default router