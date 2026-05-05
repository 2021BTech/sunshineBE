import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database'
import experienceRoutes from './routes/experienceRoutes'
import uploadRoutes from './routes/uploadRoutes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/experience', experienceRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Import mongoose for health check
import mongoose from 'mongoose'

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})