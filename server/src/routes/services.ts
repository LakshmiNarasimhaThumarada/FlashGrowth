import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware'

const router = Router()

/* ─── Public Endpoints ─── */

// GET all service packs and their service items
router.get('/', async (req: Request, res: Response) => {
  try {
    const packs = await prisma.servicePack.findMany({
      where: { visible: true },
      include: {
        services: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
    return res.json(packs)
  } catch (err) {
    console.error('[Fetch Services Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// GET single service pack with items
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pack = await prisma.servicePack.findUnique({
      where: { id: String(req.params.id) },
      include: { services: true }
    })
    if (!pack) return res.status(404).json({ error: 'Service pack not found' })
    return res.json(pack)
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── Admin Endpoints ─── */

// POST create new service pack
router.post('/packs', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { title, description, tagline, iconName, slug } = req.body

  if (!title || !description || !slug) {
    return res.status(400).json({ error: 'Validation Error', message: 'Title, description and slug are required' })
  }

  try {
    const orderCount = await prisma.servicePack.count()
    const pack = await prisma.servicePack.create({
      data: {
        title,
        description,
        tagline: tagline || '',
        iconName: iconName || 'Briefcase',
        slug: slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        order: orderCount
      }
    })
    return res.status(201).json({ message: 'Service pack created successfully', pack })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate Error', message: 'A pack with this slug already exists' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH update service pack
router.patch('/packs/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { title, description, tagline, iconName, order, visible } = req.body

  try {
    const pack = await prisma.servicePack.update({
      where: { id: String(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tagline !== undefined && { tagline }),
        ...(iconName !== undefined && { iconName }),
        ...(order !== undefined && { order }),
        ...(visible !== undefined && { visible })
      }
    })
    return res.json({ message: 'Service pack updated', pack })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// DELETE service pack (cascades to service items)
router.delete('/packs/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.servicePack.delete({ where: { id: String(req.params.id) } })
    return res.json({ message: 'Service pack deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// POST add service item to a pack
router.post('/packs/:packId/items', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { name, description, price, slug } = req.body
  const { packId } = req.params

  if (!name || !description || price === undefined || !slug) {
    return res.status(400).json({ error: 'Validation Error', message: 'Name, description, price and slug are required' })
  }

  try {
    const pack = await prisma.servicePack.findUnique({ where: { id: String(packId) } })
    if (!pack) return res.status(404).json({ error: 'Service pack not found' })

    const item = await prisma.serviceItem.create({
      data: {
        name,
        description,
        price: Number(price),
        slug: slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        packId: String(packId)
      }
    })
    return res.status(201).json({ message: 'Service item added successfully', item })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate Error', message: 'An item with this slug already exists' })
    }
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// PATCH update service item
router.patch('/items/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { name, description, price } = req.body

  try {
    const item = await prisma.serviceItem.update({
      where: { id: String(req.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) })
      }
    })
    return res.json({ message: 'Service item updated', item })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// DELETE service item
router.delete('/items/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    await prisma.serviceItem.delete({ where: { id: String(req.params.id) } })
    return res.json({ message: 'Service item deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
