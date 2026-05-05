import { Request, Response } from 'express'
import cloudinary from '../config/cloudinary'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed'))
    }
  }
})

export const uploadAudio = [
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' })
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'sunrise-audio',
            format: 'mp3'
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(req.file!.buffer)
      })

      res.json({ 
        url: (result as any).secure_url,
        message: 'Audio uploaded successfully'
      })
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({ message: 'Error uploading audio' })
    }
  }
]