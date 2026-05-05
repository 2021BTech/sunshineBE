import mongoose from 'mongoose'

const experienceSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true,
    maxlength: [100, 'Recipient name cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  theme: {
    type: String,
    required: [true, 'Theme is required'],
    enum: {
      values: ['romantic', 'calm', 'playful'],
      message: 'Theme must be romantic, calm, or playful'
    }
  },
  audioUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string) {
        if (!v) return true
        return v.startsWith('http://') || v.startsWith('https://')
      },
      message: 'Audio URL must be a valid URL'
    }
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    validate: {
      validator: function(v: Date) {
        return v > new Date()
      },
      message: 'Scheduled time must be in the future'
    }
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Index for faster queries
experienceSchema.index({ scheduledAt: 1 })
experienceSchema.index({ createdAt: -1 })

// Remove timestamps version key
experienceSchema.set('versionKey', false)

export default mongoose.model('Experience', experienceSchema)