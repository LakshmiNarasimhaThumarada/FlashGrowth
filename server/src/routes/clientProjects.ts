import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middlewares/authMiddleware'
import { sendStatusUpdateEmail } from '../lib/email'
import { createAndBroadcastNotification } from './notifications'

const router = Router()

/* ─── Client Endpoints (Authenticated User) ─── */

// GET logged-in user's own client projects
router.get('/my', authenticateJWT as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.clientProject.findMany({
      where: {
        OR: [
          { userId: req.user?.id },
          { email: req.user?.email }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    const parsed = projects.map(p => {
      try {
        return { ...p, services: JSON.parse(p.services) }
      } catch (e) {
        return { ...p, services: [] }
      }
    })
    return res.json(parsed)
  } catch (err) {
    console.error('[Fetch My Projects Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── Admin Endpoints (Admin JWT required) ─── */

// GET all client projects
router.get('/', authenticateJWT as any, requireAdmin as any, async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.clientProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inquiry: {
          select: { status: true, id: true }
        }
      }
    })
    const parsed = projects.map(p => {
      try {
        return { ...p, services: JSON.parse(p.services) }
      } catch (e) {
        return { ...p, services: [] }
      }
    })
    return res.json(parsed)
  } catch (err) {
    console.error('[Fetch Client Projects Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// GET single client project details
router.get('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const project = await prisma.clientProject.findUnique({
      where: { id: String(req.params.id) },
      include: { inquiry: true }
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    try {
      return res.json({ ...project, services: JSON.parse(project.services) })
    } catch (e) {
      return res.json({ ...project, services: [] })
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// POST create a client project (either from an Inquiry or manually)
router.post('/', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { inquiryId, clientName, companyName, email, totalQuote, services, status, notes } = req.body

  try {
    let finalClientName = clientName
    let finalCompanyName = companyName
    let finalEmail = email
    let finalQuote = totalQuote
    let finalServices = services || []
    let finalUserId: string | null = null

    // If inquiryId is provided, pull and auto-fill details from inquiry
    if (inquiryId) {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
        include: { selectedServices: true }
      })

      if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' })

      finalClientName = inquiry.fullName
      finalCompanyName = inquiry.companyName
      finalEmail = inquiry.email
      finalQuote = inquiry.totalQuote
      finalServices = inquiry.selectedServices.map(s => s.name)
      finalUserId = inquiry.userId

      // Automatically update Inquiry status to CLOSED (meaning converted to client)
      await prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: 'CLOSED' }
      })
    }

    if (!finalClientName || !finalEmail || finalQuote === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'clientName, email, and totalQuote are required (or valid inquiryId)'
      })
    }

    // Try to find if user exists in our DB to link
    if (!finalUserId) {
      const user = await prisma.user.findUnique({ where: { email: finalEmail } })
      if (user) finalUserId = user.id
    }

    const project = await prisma.clientProject.create({
      data: {
        clientName: finalClientName,
        companyName: finalCompanyName || null,
        email: finalEmail,
        totalQuote: Number(finalQuote),
        services: JSON.stringify(finalServices),
        status: status || 'ONBOARDING',
        notes: notes || '',
        inquiryId: inquiryId || null,
        userId: finalUserId
      }
    })

    // Notify client of onboarding start
    sendStatusUpdateEmail({
      to: finalEmail,
      fullName: finalClientName,
      companyName: finalCompanyName || undefined,
      status: project.status,
      notes: notes || 'Your project workspace has been created!'
    }).catch(e => console.error('[Client Project Onboard Email Error]:', e))

    // Broadcast system notification
    createAndBroadcastNotification(
      'STATUS_CHANGE',
      `Client Project created for ${finalClientName} (${project.status})`
    )

    const responseProject = { ...project, services: finalServices }
    return res.status(201).json({ message: 'Client project created successfully', project: responseProject })
  } catch (err: any) {
    console.error('[Create Client Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH update client project status, notes, services, etc.
router.patch('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { status, notes, clientName, companyName, email, totalQuote, services } = req.body

  try {
    const existing = await prisma.clientProject.findUnique({ where: { id: String(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'Project not found' })

    let serializedServices: string | undefined = undefined
    if (services !== undefined) {
      serializedServices = JSON.stringify(services)
    }

    const updated = await prisma.clientProject.update({
      where: { id: String(req.params.id) },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(clientName !== undefined && { clientName }),
        ...(companyName !== undefined && { companyName }),
        ...(email !== undefined && { email }),
        ...(totalQuote !== undefined && { totalQuote: Number(totalQuote) }),
        ...(serializedServices !== undefined && { services: serializedServices })
      }
    })

    // If status updated, notify client via email & push notification
    if (status && status !== existing.status) {
      sendStatusUpdateEmail({
        to: updated.email,
        fullName: updated.clientName,
        companyName: updated.companyName || undefined,
        status: updated.status,
        notes: notes || `Project status updated to ${updated.status}`
      }).catch(e => console.error('[Client Project Status Email Error]:', e))

      createAndBroadcastNotification(
        'STATUS_CHANGE',
        `Project status for ${updated.clientName} updated to ${updated.status}`
      )
    }

    let parsedServices = []
    try {
      parsedServices = JSON.parse(updated.services)
    } catch (e) {}

    return res.json({ message: 'Project updated successfully', project: { ...updated, services: parsedServices } })
  } catch (err) {
    console.error('[Update Client Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// DELETE client project
router.delete('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.clientProject.delete({ where: { id: String(req.params.id) } })
    return res.json({ message: 'Client project deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router;
