import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LoginModal } from './LoginModal'
import { useNavigate, useLocation } from 'react-router-dom'

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false)
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    // If not on homepage, redirect to homepage first
    if (location.pathname !== '/') {
      e.preventDefault()
      navigate(`/${targetId}`)
    }
  }

  return (
    <>
      <motion.nav
        className={`nav-bar ${scrolled ? 'nav-bar--scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ zIndex: 1000 }}
      >
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="nav-logo">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#0A0A0A" />
            <path
              d="M38 12L20 36h12l-6 16 18-24H32l6-16z"
              fill="#0066FF"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="nav-logo-text">Flash Growth</span>
        </a>

        <ul className="nav-links">
          <li><a href="/#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a></li>
          <li><a href="/#work" onClick={(e) => handleNavClick(e, '#work')}>Our Work</a></li>
          <li><a href="/#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a></li>
          
          {isAuthenticated ? (
            /* Logged In User Dropdown */
            <li style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDropdownOpen(!dropdownOpen)
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition cursor-pointer nav-profile-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'Avatar'}
                    style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    {user?.fullName?.charAt(0) || user?.email.charAt(0)}
                  </div>
                )}
                <span>{user?.fullName?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '10px',
                      backgroundColor: '#fff',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      minWidth: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    {isAdmin && (
                      <button
                        onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0066FF',
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f4f7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Shield size={14} />
                        <span>Admin Panel</span>
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#333',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LayoutDashboard size={14} />
                      <span>My Dashboard</span>
                    </button>
                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ) : null}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: scrolled ? '#0A0A0A' : '#ffffff',
            padding: '4px',
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <style>{`
          @media (max-width: 768px) {
            .mobile-menu-toggle {
              display: flex !important;
            }
          }
        `}</style>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              zIndex: 99,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <a
              href="#services"
              onClick={(e) => { setMobileOpen(false); handleNavClick(e, '#services'); }}
              style={{ fontSize: '1rem', fontWeight: 500, color: '#212529', textDecoration: 'none', padding: '8px 0' }}
            >
              Services
            </a>
            <a
              href="#work"
              onClick={(e) => { setMobileOpen(false); handleNavClick(e, '#work'); }}
              style={{ fontSize: '1rem', fontWeight: 500, color: '#212529', textDecoration: 'none', padding: '8px 0' }}
            >
              Our Work
            </a>
            <a
              href="#contact"
              onClick={(e) => { setMobileOpen(false); handleNavClick(e, '#contact'); }}
              style={{ fontSize: '1rem', fontWeight: 500, color: '#212529', textDecoration: 'none', padding: '8px 0' }}
            >
              Contact
            </a>
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
                  style={{ fontSize: '1rem', fontWeight: 500, color: '#333', textDecoration: 'none', padding: '8px 0' }}
                >
                  My Dashboard
                </a>
                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => { setMobileOpen(false); navigate('/admin'); }}
                    style={{ fontSize: '1rem', fontWeight: 500, color: '#0066FF', textDecoration: 'none', padding: '8px 0' }}
                  >
                    Admin Panel
                  </a>
                )}
                <button
                  onClick={() => { setMobileOpen(false); logout(); navigate('/'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 28px',
                    backgroundColor: '#FEF2F2',
                    color: '#EF4444',
                    borderRadius: '40px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    marginTop: '8px'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
