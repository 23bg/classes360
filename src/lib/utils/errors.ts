import { NextResponse } from 'next/server'
import { logger, serializeError } from '@/lib/logger'

/** 
 * Base class for all app-specific errors
 */
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Common error types
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404)
  }
}

/**
 * Fallback error response generator for API routes
 */
export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        status: error.statusCode,
      },
      { status: error.statusCode }
    )
  }

  logger.error({
    event: 'unexpected_error',
    error: serializeError(error),
  })
  return NextResponse.json(
    {
      success: false,
      message: 'Internal Server Error',
      status: 500,
    },
    { status: 500 }
  )
}

