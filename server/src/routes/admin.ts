import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware'

const router = Router()

/**
 * GET /api/admin/stats
 * Returns high-level KPI metrics for the admin dashboard.
 * Protected: JWT + ADMIN role required.
 */
router.get('/stats', authenticateJWT as any, requireAdmin as any, async (_req: Request, res: Response) => {
  try {
    const [
      totalInquiries,
      pendingInquiries,
      inProgressInquiries,
      closedInquiries,
      totalRevenue,
      recentInquiries,
      totalProjects,
      totalUsers,
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.inquiry.count({ where: { status: 'CLOSED' } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          companyName: true,
          businessType: true,
          totalQuote: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.clientProject.count(),
      prisma.user.count(),
    ])

    return res.json({
      inquiries: {
        total: totalInquiries,
        pending: pendingInquiries,
        inProgress: inProgressInquiries,
        closed: closedInquiries,
        conversionRate: totalInquiries > 0
          ? Math.round((closedInquiries / totalInquiries) * 100)
          : 0,
      },
      revenue: {
        totalCollected: totalRevenue._sum.amount ?? 0,
      },
      projects: {
        total: totalProjects,
      },
      members: {
        total: totalUsers,
      },
      recentInquiries,
    })
  } catch (err) {
    console.error('[Admin Stats Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to load admin statistics' })
  }
})

/**
 * GET /api/admin/inquiries/by-status
 * Group inquiries by status — useful for kanban board view.
 */
router.get('/inquiries/by-status', authenticateJWT as any, requireAdmin as any, async (_req: Request, res: Response) => {
  try {
    const grouped = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const result: Record<string, number> = {}
    grouped.forEach(g => {
      result[g.status] = g._count.id
    })

    return res.json(result)
  } catch (err) {
    console.error('[Group By Status Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * GET /api/admin/members
 * List all users with pagination & search capabilities
 */
router.get('/members', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { search } = req.query

  try {
    const members = await prisma.user.findMany({
      where: search ? {
        OR: [
          { fullName: { contains: String(search) } },
          { email: { contains: String(search) } }
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' }
    })
    return res.json(members)
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * PATCH /api/admin/members/:id/role
 * Edit user role (promote/demote user)
 */
router.patch('/members/:id/role', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { role } = req.body

  if (role !== 'USER' && role !== 'ADMIN') {
    return res.status(400).json({ error: 'Validation Error', message: 'Role must be either USER or ADMIN' })
  }

  try {
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role: role as any }
    })
    return res.json({ message: 'User role updated successfully', user })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/**
 * DELETE /api/admin/members/:id
 * Delete user account
 */
router.delete('/members/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } })
    return res.json({ message: 'User deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
