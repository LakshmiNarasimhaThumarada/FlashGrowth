import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../context/AuthContext'

interface Project {
  id: string
  clientName: string
  category: 'Branding' | 'Marketing' | 'Content' | 'Growth'
  services: string[]
  result: string
  imageUrl: string
  color: string | null
}

const fallbackProjects: Project[] = [
  {
    id: 'proj-1',
    clientName: 'Aura Cosmetics',
    category: 'Branding',
    services: ['Brand Strategy', 'Visual Identity', 'Guidelines'],
    result: '+140% brand recognition and premium market positioning within 6 months.',
    imageUrl: '/portfolio/aura_branding.png',
    color: '#0A0A0A',
  },
  {
    id: 'proj-2',
    clientName: 'Nexis Pay',
    category: 'Marketing',
    services: ['Paid Ads (Meta/Google)', 'Funnel Optimization'],
    result: '3.6x increase in app downloads with a 42% reduction in acquisition cost.',
    imageUrl: '/portfolio/nexis_marketing.png',
    color: '#F8F9FA',
  },
  {
    id: 'proj-3',
    clientName: 'Velo Motion',
    category: 'Content',
    services: ['Video Production', 'Creative Copywriting'],
    result: 'Over 2.5 million organic views across social channels and high engagement rate.',
    imageUrl: '/portfolio/velo_content.png',
    color: '#0066FF',
  },
  {
    id: 'proj-4',
    clientName: 'Apex Software',
    category: 'Growth',
    services: ['SEO Audit', 'Conversion Optimization (CRO)'],
    result: '+82% demo bookings organically from high-intent Google search traffic.',
    imageUrl: '/portfolio/apex_growth.png',
    color: '#212529',
  },
  {
    id: 'proj-5',
    clientName: 'Kira Jewelry',
    category: 'Branding',
    services: ['Packaging Mockups', 'E-commerce Design'],
    result: 'Successful rebrand launch driving a 28% increase in average order value.',
    imageUrl: '/portfolio/kira_branding.png',
    color: '#ADB5BD',
  },
  {
    id: 'proj-6',
    clientName: 'Summit Athletics',
    category: 'Marketing',
    services: ['Influencer Marketing', 'Email Campaigns'],
    result: '$480K generated in campaign revenue with 12x return on ad spend (ROAS).',
    imageUrl: '/portfolio/summit_marketing.png',
    color: '#002966',
  },
]

const categories = ['All', 'Branding', 'Marketing', 'Content', 'Growth'] as const
type CategoryFilter = typeof categories[number]

export function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All')
  const [projects, setProjects] = useState<Project[]>([])
  const [_loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data)
            return
          }
        }
      } catch (err) {
        console.error('[Portfolio Fetch Error]:', err)
      } finally {
        setLoading(false)
      }
      
      // Fallback to hardcoded list if database is empty or fetch fails
      setProjects(fallbackProjects)
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'All') return true
    return project.category === activeFilter
  })

  return (
    <section className="portfolio-section" id="work">
      <div className="portfolio-container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Proven Results</span>
          <h2 className="section-title">Past Client Work</h2>
          <p className="section-subtitle">
            Explore how we partner with ambitious brands to spark exponential growth, build unforgettable identities, and dominate digital platforms.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-wrapper">
          <div className="filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab-btn ${activeFilter === cat ? 'filter-tab-btn--active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                <span>{cat}</span>
                {activeFilter === cat && (
                  <motion.div
                    className="active-tab-line"
                    layoutId="activeTabUnderline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <motion.div layout className="portfolio-grid">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                key={project.id}
                className="project-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="project-image-container">
                  <img
                    src={project.imageUrl}
                    alt={`${project.clientName} project showcase`}
                    className="project-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  {/* Immersive SVG Fallback Card */}
                  <div className="project-svg-fallback" style={{ backgroundColor: project.color === '#F8F9FA' ? '#FFFFFF' : project.color || '#0066FF' }}>
                    <div className="fallback-inner">
                      <div className="fallback-tag">{project.category}</div>
                      <h4 className={`fallback-logo-text ${project.color === '#F8F9FA' ? 'text-dark' : 'text-light'}`}>
                        {project.clientName}
                      </h4>
                    </div>
                  </div>

                  {/* Dynamic Dark Overlay on Hover */}
                  <div className="project-overlay">
                    <div className="overlay-content">
                      <span className="project-category-tag">{project.category}</span>
                      <h4 className="project-client-title">{project.clientName}</h4>
                      
                      <div className="project-services-list">
                        {project.services.map((s, i) => (
                          <span key={i} className="service-tag">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="project-result-box">
                        <div className="result-indicator-dot" />
                        <p className="result-text">{project.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
