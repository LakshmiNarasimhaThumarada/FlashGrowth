import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initialize Prisma client
export const prisma = new PrismaClient()

// Seed database services and settings if empty
import { seedServices } from './lib/seed'
seedServices(prisma).catch(err => console.error('[Startup Seed Failed]:', err))

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// JSON parser (Stripe webhook needs raw body, we handle that in the route)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/stripe-webhook') {
    next()
  } else {
    express.json()(req, res, next)
  }
})

// Global rate limiter — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
})
app.use('/api', limiter)

// Basic status check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Register Api Routes
import authRoutes from './routes/auth'
import inquiryRoutes from './routes/inquiry'
import paymentRoutes from './routes/payment'
import projectRoutes from './routes/project'
import adminRoutes from './routes/admin'
import servicesRoutes from './routes/services'
import notificationsRoutes from './routes/notifications'
import clientProjectsRoutes from './routes/clientProjects'
import settingsRoutes from './routes/settings'

app.use('/api/auth', authRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/client-projects', clientProjectsRoutes)
app.use('/api/settings', settingsRoutes)

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]:', err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server
const server = app.listen(port, () => {
  console.log(`[Server]: Flash Growth API running on http://localhost:${port}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server]: SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    prisma.$disconnect()
    console.log('[Server]: Database disconnected. Closed.')
  })
})
