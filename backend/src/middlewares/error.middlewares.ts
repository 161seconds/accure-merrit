import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message || err)

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({
      message: err.message,
      ...(err as any).errors ? { errors: (err as any).errors } : {}
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message)
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: messages.join(', ')
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(HTTP_STATUS.CONFLICT).json({
      message: `${field} đã tồn tại`
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: 'Token không hợp lệ'
    })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: 'Token đã hết hạn'
    })
  }

  // Default
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Lỗi hệ thống, vui lòng thử lại sau'
  })
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors
  })
}

export default errorHandler 