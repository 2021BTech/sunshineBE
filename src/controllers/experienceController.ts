import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Experience from '../models/experience'


export const createExperience = async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body)
    
    const { recipientName, message, theme, scheduledAt, audioUrl } = req.body

    // Detailed validation
    const errors: string[] = []
    
    if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length === 0) {
      errors.push('Recipient name is required and must be a non-empty string')
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      errors.push('Message is required and must be a non-empty string')
    }
    
    if (!theme || !['romantic', 'calm', 'playful'].includes(theme)) {
      errors.push('Theme must be one of: romantic, calm, playful')
    }
    
    if (!scheduledAt) {
      errors.push('Scheduled time is required')
    } else {
      const scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime())) {
        errors.push('Invalid scheduled time format')
      } else if (scheduledDate <= new Date()) {
        errors.push('Scheduled time must be in the future')
      }
    }
    
    if (audioUrl && typeof audioUrl !== 'string') {
      errors.push('Audio URL must be a string if provided')
    }
    
    if (errors.length > 0) {
      console.log('Validation errors:', errors)
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      })
    }

    // Create experience object
    const experienceData: any = {
      recipientName: recipientName.trim(),
      message: message.trim(),
      theme,
      scheduledAt: new Date(scheduledAt)
    }
    
    if (audioUrl && audioUrl.trim()) {
      experienceData.audioUrl = audioUrl.trim()
    }
    
    console.log('Creating experience with data:', experienceData)
    
    const experience = new Experience(experienceData)
    await experience.save()
    
    console.log('Experience created successfully:', experience._id)
    
    res.status(201).json({
      id: experience._id,
      message: 'Experience created successfully'
    })
  } catch (error: any) {
    console.error('Create experience error details:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      })
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: 'Error creating experience',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const getExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid experience ID format' })
    }
    
    const experience = await Experience.findById(id)
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' })
    }
    
    // Increment view count
    experience.viewCount += 1
    await experience.save()
    
    res.json({
      recipientName: experience.recipientName,
      message: experience.message,
      theme: experience.theme,
      audioUrl: experience.audioUrl,
      scheduledAt: experience.scheduledAt,
      viewCount: experience.viewCount,
      createdAt: experience.createdAt
    })
  } catch (error: any) {
    console.error('Get experience error:', error)
    res.status(500).json({ 
      message: 'Error fetching experience',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}