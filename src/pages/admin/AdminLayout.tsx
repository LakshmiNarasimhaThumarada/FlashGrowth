import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Briefcase, Users, Settings, Bell,
  Shield, LogOut, ArrowLeft
} from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface NotificationItem {
  id: string
  type: 'NEW_USER' | 'NEW_INQUIRY' | 'PAYMENT_SUCCESS' | 'STATUS_CHANGE' | 'SYSTEM'
  message: string
  read: boolean
  createdAt: string
}

export function AdminLayout() {
  const { user, token, loading: authLoading, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifOpen, setNotifOpen] = useState(false)

  // Auth gate check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        navigate('/')
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  // Load existing notifications and start SSE connection
  useEffect(() => {
    if (!token || !isAdmin) return

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch (err) {
        console.error('[Load Notifications Error]:', err)
      }
    }

    loadNotifications()

    // Establish Server-Sent Events stream for real-time notifications
    const eventSource = new EventSource(`${API_URL}/api/notifications/stream?token=${token}`)
    
    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data)
        setNotifications(prev => [newNotif, ...prev])
        
        // Play subtle sound alert or display native toast if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Flash Growth Admin Alert', { body: newNotif.message })
        }
      } catch (err) {
        console.error('[SSE Parse Error]:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[SSE Stream Error]:', err)
      eventSource.close()
    }

    // Request browser notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      eventSource.close()
    }
  }, [token, isAdmin])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const clearNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !n.read))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markSingleRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#fff' }}>
        <div className="login-spinner" style={{ border: '3px solid #333', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Services Editor', path: '/admin/services', icon: Briefcase },
    { label: 'Client CRM Board', path: '/admin/clients', icon: FileText },
    { label: 'Our Work Section', path: '/admin/portfolio', icon: Shield },
    { label: 'Member Accounts', path: '/admin/members', icon: Users },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
  ]

  const getNotifIconColor = (type: string) => {
    switch (type) {
      case 'PAYMENT_SUCCESS': return '#059669'
      case 'NEW_INQUIRY': return '#0066FF'
      case 'NEW_USER': return '#8B5CF6'
      case 'STATUS_CHANGE': return '#D97706'
      default: return '#6B7280'
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }} className="font-sans">
      
      {/* Admin Left Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#0A0A0A',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #1F2937',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100
        }}
      >
        <div>
          {/* Header Branding */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Flash<span style={{ color: '#0066FF' }}>Admin</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: isActive ? '#fff' : '#9CA3AF',
                    backgroundColor: isActive ? '#1F2937' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = '#9CA3AF')}
                >
                  <Icon size={18} style={{ color: isActive ? '#0066FF' : 'inherit' }} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer Profile */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #1F2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Admin" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                A
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.fullName || 'Admin'}</p>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Operations</span>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Area Container */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#4B5563', fontSize: '13px', fontWeight: 600 }}>
              <ArrowLeft size={14} />
              <span>Back to Public Website</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  color: '#4B5563',
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6'
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: '#EF4444',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #fff'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    {/* Click backdrop */}
                    <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 }} onClick={() => setNotifOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '12px',
                        width: '360px',
                        maxHeight: '440px',
                        backgroundColor: '#fff',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 11
                      }}
                    >
                      {/* Dropdown Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0A' }}>Notifications</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#0066FF', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Mark read</button>
                          <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Clear read</button>
                        </div>
                      </div>

                      {/* Dropdown List */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {notifications.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px', fontSize: '12px', color: '#9CA3AF' }}>
                            Zero administrative notifications active.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {notifications.map(notif => (
                              <div
                                key={notif.id}
                                onClick={() => markSingleRead(notif.id)}
                                style={{
                                  display: 'flex',
                                  gap: '12px',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  backgroundColor: notif.read ? 'transparent' : '#F4F7FF',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : '#F4F7FF')}
                              >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getNotifIconColor(notif.type), marginTop: '5px', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: '1.4', fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                                  <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <div style={{ flex: 1, padding: '40px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
