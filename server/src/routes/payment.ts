import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import express from 'express'
import { prisma } from '../index'
import { sendPaymentSuccessEmail } from '../lib/email'
import { createAndBroadcastNotification } from './notifications'

const router = Router()

// Initialize Gateways (with safe fallback variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any
})

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock',
})

/* ─── Stripe Endpoint: Create Payment Intent ─── */
router.post('/stripe/create-intent', async (req: Request, res: Response) => {
  const { inquiryId } = req.body

  if (!inquiryId) {
    return res.status(400).json({ error: 'Inquiry ID is required' })
  }

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' })
    }

    // Stripe amount represents cents
    const amountInCents = Math.round(inquiry.totalQuote * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { inquiryId: inquiry.id },
    })

    // Store pending transaction in our db
    await prisma.payment.create({
      data: {
        amount: inquiry.totalQuote,
        currency: 'USD',
        gateway: 'STRIPE',
        gatewayId: paymentIntent.id,
        paymentStatus: 'PENDING',
        inquiryId: inquiry.id,
      },
    })

    return res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    })
  } catch (err) {
    console.error('[Stripe Intent Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to initialize Stripe checkout' })
  }
})

/* ─── Razorpay Endpoint: Create Order ─── */
router.post('/razorpay/create-order', async (req: Request, res: Response) => {
  const { inquiryId } = req.body

  if (!inquiryId) {
    return res.status(400).json({ error: 'Inquiry ID is required' })
  }

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    })

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' })
    }

    // Convert quote (USD) to INR (use fixed 1 USD = 83 INR for demonstration)
    const inrRate = 83
    const amountInPaise = Math.round(inquiry.totalQuote * inrRate * 100)

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${inquiry.id.slice(0, 8)}`,
      notes: { inquiryId: inquiry.id },
    }

    const order = await razorpay.orders.create(options)

    // Store pending transaction in our db
    await prisma.payment.create({
      data: {
        amount: inquiry.totalQuote * inrRate,
        currency: 'INR',
        gateway: 'RAZORPAY',
        gatewayId: order.id,
        paymentStatus: 'PENDING',
        inquiryId: inquiry.id,
      },
    })

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || '',
    })
  } catch (err) {
    console.error('[Razorpay Order Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to initialize Razorpay order' })
  }
})

/* ─── Razorpay Endpoint: Signature Verification ─── */
router.post('/razorpay/verify', async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Verification credentials missing' })
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock'
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      // Update payment record in database
      const payment = await prisma.payment.update({
        where: { gatewayId: razorpay_order_id },
        data: {
          paymentStatus: 'SUCCESS',
          signature: razorpay_signature,
        },
        include: { inquiry: true },
      })

      // Notify client of successful payment
      sendPaymentSuccessEmail({
        to: payment.inquiry.email,
        fullName: payment.inquiry.fullName,
        totalQuote: payment.inquiry.totalQuote,
        gateway: 'Razorpay',
        gatewayId: razorpay_payment_id,
      }).catch(e => console.error('[Razorpay Payment Email Error]:', e))

      // Notify admin of successful payment
      createAndBroadcastNotification(
        'PAYMENT_SUCCESS',
        `Razorpay payment of ₹${payment.amount} received from ${payment.inquiry.fullName}`,
        payment.inquiry.userId || undefined
      ).catch(e => console.error('[Razorpay Notification Error]:', e))

      return res.json({ status: 'success', message: 'Payment verified successfully' })
    } else {
      await prisma.payment.update({
        where: { gatewayId: razorpay_order_id },
        data: { paymentStatus: 'FAILED' },
      })
      return res.status(400).json({ status: 'failure', message: 'Invalid payment signature' })
    }
  } catch (err) {
    console.error('[Razorpay Verification Error]:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* ─── Stripe Endpoint: Webhook Signature Verification ─── */
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    return res.status(400).send('Webhook Error: Stripe signature header is missing')
  }

  let event: Stripe.Event

  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err: any) {
    console.error('[Stripe Webhook Verification Failed]:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    try {
      const payment = await prisma.payment.update({
        where: { gatewayId: paymentIntent.id },
        data: { paymentStatus: 'SUCCESS' },
        include: { inquiry: true },
      })
      console.log(`[Stripe Webhook]: Payment ${paymentIntent.id} updated to SUCCESS`)

      // Notify client
      sendPaymentSuccessEmail({
        to: payment.inquiry.email,
        fullName: payment.inquiry.fullName,
        totalQuote: payment.inquiry.totalQuote,
        gateway: 'Stripe',
        gatewayId: paymentIntent.id,
      }).catch(e => console.error('[Stripe Payment Email Error]:', e))

      // Notify admin
      createAndBroadcastNotification(
        'PAYMENT_SUCCESS',
        `Stripe payment of $${payment.inquiry.totalQuote} received from ${payment.inquiry.fullName}`,
        payment.inquiry.userId || undefined
      ).catch(e => console.error('[Stripe Notification Error]:', e))
    } catch (dbErr) {
      console.error('[Webhook DB Update Error]:', dbErr)
    }
  }

  return res.json({ received: true })
})

export default router
