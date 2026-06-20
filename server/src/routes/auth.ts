import { Router, Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/authMiddleware'
import { createAndBroadcastNotification } from './notifications'

const router = Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/* ─── GET /me — Get current user profile ─── */
router.get('/me', authenticateJWT as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role
    })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── POST /google — Exchange Google credentials token for session JWT ─── */
router.post('/google', async (req: Request, res: Response) => {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required' })
  }

  try {
    // Verify Google ID Token or use mock credential for dev bypass
    let email: string
    let name: string | undefined
    let picture: string | undefined
    let googleId: string

    if (credential === 'mock-client-credential-123') {
      email = 'client@flashgrowth.com'
      name = 'Demo Client'
      picture = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80'
      googleId = 'mock-google-id-123456'
    } else {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Invalid Google payload' })
      }

      email = payload.email
      name = payload.name
      picture = payload.picture
      googleId = payload.sub
    }

    // Query or upsert user account in database
    let user = await prisma.user.findUnique({
      where: { email },
    })

    let isNewUser = false

    if (!user) {
      isNewUser = true
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || null,
          avatarUrl: picture || null,
          googleId,
          role: 'USER', // Update manually in DB for ADMIN role
        },
      })
    } else {
      // Link Google ID if user was created via manual email lead previously
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId,
          avatarUrl: picture || user.avatarUrl,
          lastLogin: new Date()
        },
      })
    }

    // Generate session JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key'
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    )

    // Fire unread in-app notification for admin if user is new
    if (isNewUser) {
      createAndBroadcastNotification(
        'NEW_USER',
        `New member joined: ${user.fullName || user.email}`
      )
    } else {
      createAndBroadcastNotification(
        'SYSTEM',
        `Member logged in: ${user.fullName || user.email}`
      )
    }

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[OAuth Verification Error]:', err)
    return res.status(401).json({ error: 'Unauthorized', message: 'Failed to verify Google login token' })
  }
})

/* ─── POST /admin-login — Fallback Admin Credentials Direct Login ─── */
router.post('/admin-login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Predefined developer fallback admin credentials (set in env or defaults)
  const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@flashgrowth.com'
  const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (email === envAdminEmail && password === envAdminPassword) {
    try {
      // Ensure admin user exists in DB
      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            fullName: 'Flash Growth Admin',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
            role: 'ADMIN',
          }
        })
      } else if (user.role !== 'ADMIN') {
        // Upgrade role if exists but not admin
        user = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN', lastLogin: new Date() }
        })
      } else {
        // Just update lastLogin
        user = await prisma.user.update({
          where: { email },
          data: { lastLogin: new Date() }
        })
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key'
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' as any }
      )

      createAndBroadcastNotification('SYSTEM', 'Admin logged in via credentials')

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        }
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  return res.status(401).json({ error: 'Unauthorized', message: 'Invalid admin credentials' })
})

export default router
