import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Megaphone, Video, TrendingUp, X, Check, ArrowRight, HelpCircle, Activity } from 'lucide-react'
import { InquiryFormModal } from './InquiryFormModal'
import { API_URL } from '../context/AuthContext'

// Map icon string names to Lucide icons
const iconMap: Record<string, any> = {
  Briefcase,
  Megaphone,
  Video,
  TrendingUp,
  Activity
}

const getIcon = (name: string) => {
  return iconMap[name] || HelpCircle
}

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
}

interface ServicePack {
  id: string
  title: string
  description: string
  iconName: string
  tagline: string
  services: ServiceItem[]
}

const fallbackServicePacks: ServicePack[] = [
  {
    id: 'business',
    title: 'Business Pack',
    description: 'Transform your brand presence, define your identity, and set a market-winning strategy.',
    tagline: 'Brand strategy, identity, and market positioning.',
    iconName: 'Briefcase',
    services: [
      { id: 'biz-1', name: 'Brand Strategy & Positioning', description: 'Deep-dive competitive research, target persona mapping, and brand architecture.', price: 1500 },
      { id: 'biz-2', name: 'Logo & Visual Identity System', description: 'Premium logo design, color palettes, typography styling, and visual assets.', price: 2000 },
      { id: 'biz-3', name: 'Comprehensive Brand Guidelines', description: 'Usage manuals, asset packs, rules for digital and print formats.', price: 800 },
      { id: 'biz-4', name: 'Competitor Landscape Analysis', description: 'Market research, differentiator planning, and SWOT breakdown.', price: 1200 },
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing Pack',
    description: 'Launch high-performing digital marketing campaigns that capture demand and scale ROI.',
    tagline: 'Multi-channel campaigns, social growth, and paid media.',
    iconName: 'Megaphone',
    services: [
      { id: 'mkt-1', name: 'Paid Ads Management (Meta & Google)', description: 'Ad copywriting, asset testing, keyword bidding, and conversion setup.', price: 1800 },
      { id: 'mkt-2', name: 'Social Media Strategy & Grid Design', description: 'Monthly content calendars, visual guidelines, and audience engagement plans.', price: 1200 },
      { id: 'mkt-3', name: 'Email Marketing & Lead Nurturing', description: 'Automation flows, newsletter designs, list segmentation, and copywriting.', price: 1000 },
      { id: 'mkt-4', name: 'Influencer Marketing Campaign Setup', description: 'Outreach templates, brief creation, tracking links, and contract management.', price: 1500 },
    ]
  },
  {
    id: 'content',
    title: 'Content Pack',
    description: 'High-production visual storytelling and content assets designed to educate and inspire.',
    tagline: 'Premium video production, copy, and graphic assets.',
    iconName: 'Video',
    services: [
      { id: 'cnt-1', name: 'Website Copy & SEO Blogging', description: 'Conversion-focused copywriting for main pages and high-intent blog posts.', price: 800 },
      { id: 'cnt-2', name: 'Promo Video Production & Editing', description: 'High-end scriptwriting, cinematic editing, sound design, and color grading.', price: 2500 },
      { id: 'cnt-3', name: 'Social Media Graphic Assets', description: 'Templates, carousels, stories, and display banners designed to convert.', price: 1200 },
      { id: 'cnt-4', name: 'Professional Product Showcase Assets', description: 'High-fidelity product rendering or curated photography assets.', price: 2000 },
    ]
  },
  {
    id: 'growth',
    title: 'Growth Pack',
    description: 'Optimize your digital touchpoints, organic reach, and analytics to maximize growth.',
    tagline: 'SEO optimization, CRO audits, and analytical infrastructure.',
    iconName: 'TrendingUp',
    services: [
      { id: 'gro-1', name: 'Technical & On-Page SEO Audit', description: 'Site architecture audits, speed optimization, and search rankings improvement.', price: 1400 },
      { id: 'gro-2', name: 'Conversion Rate Optimization (CRO)', description: 'A/B testing plans, landing page rewrites, and user journey optimization.', price: 1800 },
      { id: 'gro-3', name: 'Custom Analytics & Funnel Setup', description: 'GA4, GTM, and custom event tracking implementation.', price: 900 },
      { id: 'gro-4', name: 'Revenue Funnel Strategy & Audits', description: 'End-to-end user path analysis and optimization advice.', price: 2200 },
    ]
  }
]

export function Services() {

  const [servicePacks, setServicePacks] = useState<ServicePack[]>([])
  const [activePack, setActivePack] = useState<ServicePack | null>(null)
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch service packs from database API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setServicePacks(data)
            return
          }
        }
      } catch (err) {
        console.error('[Services Fetch Error]:', err)
      } finally {
        setLoading(false)
      }
      // Fallback to static mock data if fetch fails or database is empty
      setServicePacks(fallbackServicePacks)
    }
    fetchServices()
  }, [])

  // Open drawer if logged in, otherwise prompt login
  const handleViewServices = (pack: ServicePack) => {
    openPack(pack)
  }

  const openPack = (pack: ServicePack) => {
    const updated = { ...selectedServices }
    pack.services.forEach((s) => {
      if (updated[s.id] === undefined) {
        updated[s.id] = true // pre-select
      }
    })
    setSelectedServices(updated)
    setActivePack(pack)
    document.body.style.overflow = 'hidden' // Lock scroll when panel is open
  }

  const closePack = () => {
    setActivePack(null)
    document.body.style.overflow = 'auto' // Restore scroll
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }))
  }

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Grow Fast, Grow Bold</span>
          <h2 className="section-title">Our Growth Packs</h2>
          <p className="section-subtitle">
            Tailor-made service packs designed to scale businesses. Select a pack, customize individual services, and construct your perfect campaign.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="login-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          /* Grid of Packs */
          <div className="packs-grid">
            {servicePacks.map((pack, idx) => {
              const Icon = getIcon(pack.iconName)
              return (
                <motion.div
                  key={pack.id}
                  className="pack-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="pack-card-header">
                    <div className="pack-icon-wrapper">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="pack-title">{pack.title}</h3>
                  </div>
                  <p className="pack-description">{pack.description}</p>
                  <button className="pack-cta-btn cursor-pointer" onClick={() => handleViewServices(pack)}>
                    <span>View Services</span>
                    <ArrowRight size={16} className="arrow-icon" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Side Detail Panel / Modal */}
      <AnimatePresence>
        {activePack && (
          <>
            {/* Backdrop */}
            <motion.div
              className="panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePack}
            />

            {/* Slide-over panel */}
            <motion.div
              className="panel-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              {/* Drawer Header */}
              <div className="drawer-header">
                <div>
                  <span className="drawer-label">Configure Services</span>
                  <h3 className="drawer-title">{activePack.title}</h3>
                  <p className="drawer-subtitle">{activePack.tagline}</p>
                </div>
                <button className="drawer-close-btn" onClick={closePack} aria-label="Close panel">
                  <X size={20} />
                </button>
              </div>

              {/* Service list scroll area */}
              <div className="drawer-body">
                <div className="services-list">
                  {activePack.services.map((service) => {
                    const isSelected = !!selectedServices[service.id]
                    return (
                      <div
                        key={service.id}
                        className={`service-item-card ${isSelected ? 'service-item-card--selected' : ''}`}
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="checkbox-outer">
                          <div className={`checkbox-inner ${isSelected ? 'checkbox-inner--checked' : ''}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                        <div className="service-info">
                          <div className="service-name-row">
                            <span className="service-name">{service.name}</span>
                          </div>
                          <p className="service-desc">{service.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Fixed Bottom Total & CTA */}
              <div className="drawer-footer">
                <button
                  className="drawer-checkout-btn"
                  disabled={!activePack.services.some(s => selectedServices[s.id])}
                  onClick={() => setIsFormModalOpen(true)}
                >
                  <span>Request Strategy Consultation</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Inquiry Form Modal */}
      {activePack && (
        <InquiryFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          selectedServices={activePack.services.filter((s) => selectedServices[s.id])}
        />
      )}


    </section>
  )
}
