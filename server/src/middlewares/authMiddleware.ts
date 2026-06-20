import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'USER' | 'ADMIN'
  }
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.query && req.query.token) {
    token = req.query.token as string
  }

  if (token) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'

    try {
      const decoded = jwt.verify(token, secret) as any
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      }
      return next()
    } catch (err) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid or expired token' })
    }
  }

  return res.status(401).json({ error: 'Unauthorized', message: 'Authorization token required' })
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'ADMIN') {
    return next()
  }
  return res.status(403).json({ error: 'Forbidden', message: 'Administrator role required' })
}
