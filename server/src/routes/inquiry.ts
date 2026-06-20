import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middlewares/authMiddleware'
import { sendInquiryConfirmation, sendLeadAlert } from '../lib/email'
import { createAndBroadcastNotification } from './notifications'

const router = Router()

interface ServiceItem {
  id: string
  name: string
  price: number
}

/* ─── POST / — Submit new inquiry (public) ─── */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const {
    fullName,
    mobileNumber,
    email,
    businessType,
    companyName,
    projectDescription,
    services, // Array<{ id, name, price }>
  } = req.body

  if (!fullName || !mobileNumber || !email || !businessType || !projectDescription) {
    return res.status(400).json({ error: 'Validation Error', message: 'Missing required fields: fullName, mobileNumber, email, businessType, projectDescription' })
  }

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'At least one service must be selected' })
  }

  try {
    const totalQuote = services.reduce((sum: number, s: ServiceItem) => sum + (Number(s.price) || 0), 0)

    const inquiry = await prisma.inquiry.create({
      data: {
        fullName,
        mobileNumber,
        email,
        businessType,
        companyName: companyName || null,
        projectDescription,
        totalQuote,
        userId: req.user?.id || null,
        selectedServices: {
          create: services.map((s: ServiceItem) => ({
            serviceId: s.id,
            name: s.name,
            price: s.price,
          })),
        },
      },
      include: {
        selectedServices: true,
      },
    })

    // Fire emails asynchronously — never block the HTTP response
    Promise.allSettled([
      sendInquiryConfirmation({ to: email, fullName, services, totalQuote, companyName }),
      sendLeadAlert({ fullName, email, mobileNumber, companyName, businessType, projectDescription, services, totalQuote, inquiryId: inquiry.id }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[Email Error #${i}]:`, r.reason)
      })
    })

    // Broadcast new lead notification
    createAndBroadcastNotification(
      'NEW_INQUIRY',
      `New inquiry from ${fullName} for $${totalQuote.toLocaleString()}`,
      inquiry.userId || undefined
    ).catch(e => console.error('[Notification Error]:', e))

    return res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry.id,
      totalQuote,
    })
  } catch (err) {
    console.error('[Inquiry Submission Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to save inquiry' })
  }
})

/* ─── GET / — List all inquiries (admin only) ─── */
router.get('/', authenticateJWT as any, requireAdmin as any, async (_req: Request, res: Response) => {
  try {
    const list = await prisma.inquiry.findMany({
      include: { selectedServices: true, payments: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(list)
  } catch (err) {
    console.error('[Fetch Inquiries Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── GET /:id — Single inquiry detail (admin only) ─── */
router.get('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: String(req.params.id) },
      include: { selectedServices: true, payments: true },
    })
    if (!inquiry) return res.status(404).json({ error: 'Not Found' })
    return res.json(inquiry)
  } catch (err) {
    console.error('[Fetch Single Inquiry Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── PATCH /:id/status — Update inquiry status (admin only) ─── */
router.patch('/:id/status', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { status } = req.body
  const allowedStatuses = ['PENDING', 'CONTACTED', 'IN_PROGRESS', 'CLOSED']

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Validation Error', message: `status must be one of: ${allowedStatuses.join(', ')}` })
  }

  try {
    const updated = await prisma.inquiry.update({
      where: { id: String(req.params.id) },
      data: { status: status as any },
    })
    return res.json({ message: 'Status updated', inquiry: updated })
  } catch (err) {
    console.error('[Update Inquiry Status Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
