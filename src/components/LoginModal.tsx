import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useAuth, API_URL } from '../context/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, loginAdmin } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState('')

  // Fetch settings to get google client id
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`)
          if (res.ok) {
            setGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || '855428456885-vblg6q98845chvld6t0o1d102e3m1b01.apps.googleusercontent.com')
          }
      } catch (err) {
        console.error(err)
      }
    }
    fetchSettings()
  }, [])

  // Mount Google One-Tap/Sign-In script dynamically
  useEffect(() => {
    if (!isOpen || isAdminMode || !googleClientId) return

    const initializeGoogle = () => {
      const windowWithGoogle = window as any
      if (windowWithGoogle.google) {
        windowWithGoogle.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            setLoading(true)
            setError(null)
            try {
              await login(response.credential)
              if (onSuccess) onSuccess()
              onClose()
            } catch (err: any) {
              setError(err.message || 'Google Auth failed')
            } finally {
              setLoading(false)
            }
          },
        })

        windowWithGoogle.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: '100%' }
        )
      }
    }

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script')
      script.id = 'google-gsi-client'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.body.appendChild(script)
    } else {
      initializeGoogle()
    }
  }, [isOpen, isAdminMode, googleClientId])

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await loginAdmin(email, password)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setIsAdminMode(false)
    setEmail('')
    setPassword('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ zIndex: 1100 }}
          />

          {/* Modal Wrapper */}
          <div className="modal-wrapper" style={{ zIndex: 1101 }}>
            <motion.div
              className="modal-card login-modal-card font-sans"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{ maxWidth: '440px', width: '100%', padding: '36px' }}
            >
              {/* Close Button */}
              <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
                <X size={20} />
              </button>

              <div className="login-modal-content">
                {/* Logo */}
                <div className="login-logo font-display" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '24px' }}>
                  Flash<span className="text-blue-600" style={{ color: '#0066FF' }}>Growth</span>
                </div>

                <h3 className="login-title font-display" style={{ fontSize: '22px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>
                  {isAdminMode ? 'Administrator Login' : 'Accelerate Your Brand'}
                </h3>
                <p className="login-subtitle" style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>
                  {isAdminMode
                    ? 'Access the Flash Growth administration panel and CRM board.'
                    : 'Sign in to explore customized services, review quotes, and track project status.'}
                </p>

                {error && (
                  <div className="login-error-alert" style={{ backgroundColor: '#FFF5F5', color: '#E53E3E', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #FED7D7' }}>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="login-loading-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
                    <div className="login-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '28px', height: '28px', animation: 'spin 1s linear infinite', marginBottom: '12px' }}></div>
                    <p style={{ fontSize: '13px', color: '#666' }}>Securing connection...</p>
                  </div>
                ) : (
                  <>
                    {!isAdminMode ? (
                      /* Client Google Login */
                      <div className="google-login-section">
                        <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', color: '#888', fontSize: '12px' }}>
                          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                          <span style={{ padding: '0 10px' }}>OR</span>
                          <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true)
                            setError(null)
                            try {
                              await login('mock-client-credential-123')
                              if (onSuccess) onSuccess()
                              onClose()
                            } catch (err: any) {
                              setError(err.message || 'Demo client login failed')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          style={{
                            width: '100%',
                            border: '1px solid #0066FF',
                            backgroundColor: '#fff',
                            color: '#0066FF',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0F5FF'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff'
                          }}
                        >
                          <span>Demo Client Login (Bypass OAuth)</span>
                          <ArrowRight size={16} />
                        </button>

                        <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '12px' }}>
                          Google login requires valid developer credentials. Use Demo Client Login for quick preview.
                        </p>
                      </div>
                    ) : (
                      /* Admin Credentials Login */
                      <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Admin Email</label>
                          <input
                            type="email"
                            placeholder="admin@flashgrowth.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </div>

                        <button
                          type="submit"
                          className="admin-submit-btn"
                          style={{
                            width: '100%',
                            backgroundColor: '#000',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            marginTop: '8px',
                            border: 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000')}
                        >
                          <span>Sign In</span>
                          <ArrowRight size={16} />
                        </button>
                      </form>
                    )}
                  </>
                )}

                {/* Footer / Toggle Mode */}
                <div className="login-modal-footer" style={{ borderTop: '1px solid #eee', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    className="toggle-mode-btn"
                    onClick={() => {
                      setError(null)
                      setIsAdminMode(!isAdminMode)
                    }}
                    style={{ background: 'none', border: 'none', color: '#0066FF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isAdminMode ? 'Back to Customer Login' : 'Admin Login'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
