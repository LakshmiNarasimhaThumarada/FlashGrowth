import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware'

const router = Router()

// Array of currently connected SSE clients (administrators)
let clients: { id: string; res: Response }[] = []

/**
 * SSE broadcast helper function.
 * Other routes can import this to push real-time alerts to logged-in admins.
 */
export function broadcastNotification(notification: any) {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(notification)}\n\n`)
  })
}

// Helper to create and broadcast a notification
export async function createAndBroadcastNotification(type: any, message: string, userId?: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        userId: userId || null
      }
    })
    broadcastNotification(notification)
    return notification
  } catch (err) {
    console.error('[Notification Broadcast Error]:', err)
  }
}

/* ─── Admin Endpoints ─── */

// GET SSE real-time connection stream
router.get('/stream', authenticateJWT as any, requireAdmin as any, (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  // Prevent connection timeout (ping every 30 seconds)
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n')
  }, 30000)

  const clientId = Date.now().toString()
  clients.push({ id: clientId, res })

  // Clean up on connection close
  req.on('close', () => {
    clearInterval(pingInterval)
    clients = clients.filter(c => c.id !== clientId)
  })
})

// GET all notifications
router.get('/', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return res.json(notifications)
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH mark notification as read
router.patch('/:id/read', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { read: true }
    })
    return res.json({ message: 'Notification marked as read', notification })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH mark all notifications as read
router.patch('/read-all', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    })
    return res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// DELETE clear all read notifications
router.delete('/clear', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { read: true }
    })
    return res.json({ message: 'Read notifications cleared' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
