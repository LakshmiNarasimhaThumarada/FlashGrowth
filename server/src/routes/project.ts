import { Router, Request, Response } from 'express'
import { prisma } from '../index'
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware'
import { uploadImageBase64, deleteImageByUrl } from '../lib/cloudinary'

const router = Router()

/* ─── GET / — Public: all portfolio projects ─── */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    })
    const parsedProjects = projects.map(p => {
      try {
        return { ...p, services: JSON.parse(p.services) }
      } catch (e) {
        return { ...p, services: [] }
      }
    })
    return res.json(parsedProjects)
  } catch (err) {
    console.error('[Fetch Projects Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch portfolio projects' })
  }
})

/* ─── GET /:id — Public: single project ─── */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: String(req.params.id) } })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    try {
      return res.json({ ...project, services: JSON.parse(project.services) })
    } catch (e) {
      return res.json({ ...project, services: [] })
    }
  } catch (err) {
    console.error('[Fetch Single Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── POST / — Admin: add new portfolio project ─── */
router.post('/', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { clientName, category, services, result, imageBase64, color } = req.body

  if (!clientName || !category || !services || !result || !imageBase64) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'clientName, category, services, result, imageBase64 are all required',
    })
  }

  try {
    const upload = await uploadImageBase64(imageBase64, 'flash_growth/portfolio')

    const serviceArray = Array.isArray(services) ? services : [services]
    const project = await prisma.project.create({
      data: {
        clientName,
        category,
        services: JSON.stringify(serviceArray),
        result,
        imageUrl: upload.secure_url,
        color: color || null,
      },
    })

    return res.status(201).json({ 
      message: 'Portfolio project added successfully', 
      project: { ...project, services: serviceArray } 
    })
  } catch (err) {
    console.error('[Add Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to upload image or save project' })
  }
})

/* ─── PATCH /:id — Admin: update project metadata ─── */
router.patch('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  const { clientName, category, services, result, color } = req.body

  try {
    const project = await prisma.project.findUnique({ where: { id: String(req.params.id) } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    let serializedServices: string | undefined = undefined
    if (services !== undefined) {
      serializedServices = JSON.stringify(Array.isArray(services) ? services : [services])
    }

    const updated = await prisma.project.update({
      where: { id: String(req.params.id) },
      data: {
        ...(clientName !== undefined && { clientName }),
        ...(category   !== undefined && { category }),
        ...(serializedServices !== undefined && { services: serializedServices }),
        ...(result     !== undefined && { result }),
        ...(color      !== undefined && { color }),
      },
    })

    try {
      return res.json({ message: 'Project updated', project: { ...updated, services: JSON.parse(updated.services) } })
    } catch (e) {
      return res.json({ message: 'Project updated', project: { ...updated, services: [] } })
    }
  } catch (err) {
    console.error('[Update Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── DELETE /:id — Admin: delete project + Cloudinary asset ─── */
router.delete('/:id', authenticateJWT as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: String(req.params.id) } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    // Delete Cloudinary image first (non-fatal)
    await deleteImageByUrl(project.imageUrl)

    await prisma.project.delete({ where: { id: String(req.params.id) } })

    return res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('[Delete Project Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router;
