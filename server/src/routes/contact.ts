import { Router, Request, Response } from 'express'
import { sendContactFormSubmission } from '../lib/email'

const router = Router()

/* ─── POST / — Submit contact form (public) ─── */
router.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ 
      error: 'Validation Error', 
      message: 'All fields (name, email, phone, message) are required.' 
    })
  }

  try {
    // Fire email asynchronously so we do not block client response
    sendContactFormSubmission({ name, email, phone, message }).catch(err => {
      console.error('[Async Contact Form Mail Error]:', err)
    })

    return res.status(201).json({
      message: 'Message sent successfully.'
    })
  } catch (err) {
    console.error('[Contact Route Error]:', err)
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to process message submission' 
    })
  }
})

export default router
