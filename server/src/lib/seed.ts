import { PrismaClient } from '@prisma/client'

export async function seedServices(prisma: PrismaClient) {
  const count = await prisma.servicePack.count()
  if (count > 0) return

  console.log('[Seed]: Seeding initial Service Packs and Items...')

  const businessPack = await prisma.servicePack.create({
    data: {
      slug: 'business',
      title: 'Business Pack',
      description: 'Transform your brand presence, define your identity, and set a market-winning strategy.',
      tagline: 'Brand strategy, identity, and market positioning.',
      iconName: 'Briefcase',
      order: 0,
      services: {
        create: [
          { slug: 'biz-1', name: 'Brand Strategy & Positioning', description: 'Deep-dive competitive research, target persona mapping, and brand architecture.', price: 1500 },
          { slug: 'biz-2', name: 'Logo & Visual Identity System', description: 'Premium logo design, color palettes, typography styling, and visual assets.', price: 2000 },
          { slug: 'biz-3', name: 'Comprehensive Brand Guidelines', description: 'Usage manuals, asset packs, rules for digital and print formats.', price: 800 },
          { slug: 'biz-4', name: 'Competitor Landscape Analysis', description: 'Market research, differentiator planning, and SWOT breakdown.', price: 1200 },
        ]
      }
    }
  })

  const marketingPack = await prisma.servicePack.create({
    data: {
      slug: 'marketing',
      title: 'Marketing Pack',
      description: 'Launch high-performing digital marketing campaigns that capture demand and scale ROI.',
      tagline: 'Multi-channel campaigns, social growth, and paid media.',
      iconName: 'Megaphone',
      order: 1,
      services: {
        create: [
          { slug: 'mkt-1', name: 'Paid Ads Management (Meta & Google)', description: 'Ad copywriting, asset testing, keyword bidding, and conversion setup.', price: 1800 },
          { slug: 'mkt-2', name: 'Social Media Strategy & Grid Design', description: 'Monthly content calendars, visual guidelines, and audience engagement plans.', price: 1200 },
          { slug: 'mkt-3', name: 'Email Marketing & Lead Nurturing', description: 'Automation flows, newsletter designs, list segmentation, and copywriting.', price: 1000 },
          { slug: 'mkt-4', name: 'Influencer Marketing Campaign Setup', description: 'Outreach templates, brief creation, tracking links, and contract management.', price: 1500 },
        ]
      }
    }
  })

  const contentPack = await prisma.servicePack.create({
    data: {
      slug: 'content',
      title: 'Content Pack',
      description: 'High-production visual storytelling and content assets designed to educate and inspire.',
      tagline: 'Premium video production, copy, and graphic assets.',
      iconName: 'Video',
      order: 2,
      services: {
        create: [
          { slug: 'cnt-1', name: 'Website Copy & SEO Blogging', description: 'Conversion-focused copywriting for main pages and high-intent blog posts.', price: 800 },
          { slug: 'cnt-2', name: 'Promo Video Production & Editing', description: 'High-end scriptwriting, cinematic editing, sound design, and color grading.', price: 2500 },
          { slug: 'cnt-3', name: 'Social Media Graphic Assets', description: 'Templates, carousels, stories, and display banners designed to convert.', price: 1200 },
          { slug: 'cnt-4', name: 'Professional Product Showcase Assets', description: 'High-fidelity product rendering or curated photography assets.', price: 2000 },
        ]
      }
    }
  })

  const growthPack = await prisma.servicePack.create({
    data: {
      slug: 'growth',
      title: 'Growth Pack',
      description: 'Optimize your digital touchpoints, organic reach, and analytics to maximize growth.',
      tagline: 'SEO optimization, CRO audits, and analytical infrastructure.',
      iconName: 'TrendingUp',
      order: 3,
      services: {
        create: [
          { slug: 'gro-1', name: 'Technical & On-Page SEO Audit', description: 'Site architecture audits, speed optimization, and search rankings improvement.', price: 1400 },
          { slug: 'gro-2', name: 'Conversion Rate Optimization (CRO)', description: 'A/B testing plans, landing page rewrites, and user journey optimization.', price: 1800 },
          { slug: 'gro-3', name: 'Custom Analytics & Funnel Setup', description: 'GA4, GTM, and custom event tracking implementation.', price: 900 },
          { slug: 'gro-4', name: 'Revenue Funnel Strategy & Audits', description: 'End-to-end user path analysis and optimization advice.', price: 2200 },
        ]
      }
    }
  })

  // Create default admin settings
  await prisma.siteSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      contactEmail: 'marketing@flashgrowth.com',
      contactPhone: '+1 (555) 019-2834',
      contactAddress: '100 Pine St, San Francisco, CA',
    }
  })

  console.log('[Seed]: Database successfully seeded with growth services & settings.')
}
