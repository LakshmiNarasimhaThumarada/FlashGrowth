import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware'

const router = Router()

// GET settings (publicly accessible)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'settings' },
      update: {},
      create: {
        id: 'settings',
        stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
        contactEmail: 'marketing@flashgrowth.com',
        contactPhone: '+1 (555) 019-2834',
        contactAddress: '100 Pine St, San Francisco, CA'
      }
    })
    return res.json(settings)
  } catch (err) {
    console.error('[Fetch Settings Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH update settings (admin only)
router.patch('/', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { stripePublicKey, razorpayKeyId, contactEmail, contactPhone, contactAddress } = req.body

  try {
    const settings = await prisma.siteSettings.update({
      where: { id: 'settings' },
      data: {
        ...(stripePublicKey !== undefined && { stripePublicKey }),
        ...(razorpayKeyId !== undefined && { razorpayKeyId }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactAddress !== undefined && { contactAddress })
      }
    })
    return res.json({ message: 'Settings updated successfully', settings })
  } catch (err) {
    console.error('[Update Settings Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
