import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  })

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => error.message)
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors 
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({ 
      message: `Duplicate value for ${field}. Please use a different value.` 
    })
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: `Invalid ${err.path}: ${err.value}` 
    })
  }

  // Default error
  const statusCode = err.status || 500
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}