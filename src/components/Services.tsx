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
          setServicePacks(data)
        }
      } catch (err) {
        console.error('[Services Fetch Error]:', err)
      } finally {
        setLoading(false)
      }
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
