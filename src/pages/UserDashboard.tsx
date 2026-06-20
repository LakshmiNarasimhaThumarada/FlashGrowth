import { useState, useEffect } from 'react'
import { LayoutDashboard, FileText, Clock, AlertCircle, HelpCircle } from 'lucide-react'
import { useAuth, API_URL } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface InquiryItem {
  id: string
  fullName: string
  companyName: string | null
  totalQuote: number
  status: 'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'
  createdAt: string
  selectedServices: Array<{ name: string; price: number }>
}

interface ClientProject {
  id: string
  clientName: string
  companyName: string | null
  totalQuote: number
  status: 'ONBOARDING' | 'IN_PROGRESS' | 'REVIEW' | 'DELIVERED' | 'PAUSED' | 'CANCELLED'
  notes: string | null
  services: string[]
  createdAt: string
}

export function UserDashboard() {
  const { user, token, loading: authLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'projects'>('overview')
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Redirect to home if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load inquiries and projects
  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        
        // Load user's inquiries
        const inqRes = await fetch(`${API_URL}/api/inquiries`, { headers })
        const inqData = await inqRes.json()

        // Filter inquiries to only user's own if not admin (though backend does/should handle validation, we make double sure here)
        const myInquiries = inqRes.ok && Array.isArray(inqData) 
          ? inqData.filter((i: any) => i.email === user?.email || i.userId === user?.id)
          : []
        setInquiries(myInquiries)

        // Load user's active client projects
        const projRes = await fetch(`${API_URL}/api/client-projects/my`, { headers })
        const projData = await projRes.json()
        setProjects(projRes.ok && Array.isArray(projData) ? projData : [])
      } catch (err) {
        console.error('[Load User Dashboard Data Error]:', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [token, user])

  if (authLoading || loadingData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', backgroundColor: '#F9FAFB' }}>
        <div className="login-spinner" style={{ border: '3px solid #E5E7EB', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Preparing your workspace...</p>
      </div>
    )
  }

  // Derived KPI Stats
  const activeProjectsCount = projects.filter(p => p.status === 'ONBOARDING' || p.status === 'IN_PROGRESS' || p.status === 'REVIEW').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED':
      case 'DELIVERED':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }
      case 'CONTACTED':
      case 'REVIEW':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
      case 'PAUSED':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' }
      case 'CANCELLED':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' }
      default:
        return { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' }
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', paddingTop: '100px', paddingBottom: '60px' }} className="font-sans">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
        
        {/* Sidebar Nav */}
        <aside style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', height: 'fit-content' }}>
          {/* User Profile Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName || 'User'} style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>
                {user?.fullName?.charAt(0) || user?.email.charAt(0)}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0A0A0A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.fullName || 'Client'}</h4>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'overview' ? '#F4F7FF' : 'transparent',
                color: activeTab === 'overview' ? '#0066FF' : '#4B5563',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'inquiries' ? '#F4F7FF' : 'transparent',
                color: activeTab === 'inquiries' ? '#0066FF' : '#4B5563',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={18} />
              <span>My Inquiries</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'projects' ? '#F4F7FF' : 'transparent',
                color: activeTab === 'projects' ? '#0066FF' : '#4B5563',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Clock size={18} />
              <span>Project Progress</span>
            </button>
          </nav>
        </aside>

        {/* Content Pane */}
        <main>
          {activeTab === 'overview' && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#0A0A0A' }}>Welcome back, {user?.fullName?.split(' ')[0] || 'Client'} 👋</h2>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6B7280' }}>Track your active campaign milestones and manage custom quotes.</p>
              </div>

              {/* KPI stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Active Campaigns</span>
                    <Clock size={20} style={{ color: '#0066FF' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{activeProjectsCount}</h3>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Submitted Inquiries</span>
                    <FileText size={20} style={{ color: '#0066FF' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{inquiries.length}</h3>
                </div>
              </div>

              {/* Recent Inquiry & Active Projects splits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Recent Inquiries List */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>Recent Strategy Inquiries</h4>
                  {inquiries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: '13px' }}>
                      No inquiries submitted yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {inquiries.slice(0, 3).map(inq => {
                        const colors = getStatusColor(inq.status)
                        return (
                          <div key={inq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0A0A0A' }}>{inq.selectedServices.map(s => s.name).slice(0, 2).join(', ')}</h5>
                              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9CA3AF' }}>{new Date(inq.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: colors.bg, color: colors.text }}>{inq.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Active Projects Tracker */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>Ongoing Work Milestones</h4>
                  {projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: '13px' }}>
                      No active projects in operations yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {projects.slice(0, 3).map(proj => {
                        const colors = getStatusColor(proj.status)
                        return (
                          <div key={proj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0A0A0A' }}>{proj.services.slice(0, 2).join(', ')}</h5>
                              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9CA3AF' }}>Started: {new Date(proj.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: colors.bg, color: colors.text }}>{proj.status.replace('_', ' ')}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Your Strategy Inquiries</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>All customized plan quotes and service requests submitted by you.</p>
              </div>

              {inquiries.length === 0 ? (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px 24px', textAlign: 'center' }}>
                  <AlertCircle size={40} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>No inquiries found</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Select services on the landing page to request custom quotes.</p>
                  <button onClick={() => navigate('/#services')} style={{ backgroundColor: '#0066FF', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Explore Services</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {inquiries.map(inq => {
                    const colors = getStatusColor(inq.status)
                    return (
                      <div key={inq.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Inquiry ID: {inq.id.slice(0, 8)}</span>
                            <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700 }}>Requested on {new Date(inq.createdAt).toLocaleDateString()}</h4>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                            {inq.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Services Configured:</span>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {inq.selectedServices.map((s, idx) => (
                              <li key={idx}>
                                {s.name}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Quote estimate removed */}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Ongoing Campaign Status</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Real-time deliverables progress, workflow phases, and project reports.</p>
              </div>

              {projects.length === 0 ? (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px 24px', textAlign: 'center' }}>
                  <HelpCircle size={40} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>No project work assigned yet</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Once we confirm details of your inquiry, active tasks appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {projects.map(proj => {
                    const colors = getStatusColor(proj.status)
                    return (
                      <div key={proj.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>Work Order: {proj.id.slice(0, 8)}</span>
                            <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700 }}>Started: {new Date(proj.createdAt).toLocaleDateString()}</h4>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                            {proj.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Progress Line Graph Bar */}
                        <div style={{ margin: '24px 0 32px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px' }}>
                            <span>ONBOARDING</span>
                            <span>IN PROGRESS</span>
                            <span>REVIEW / QA</span>
                            <span>DELIVERED</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', position: 'relative' }}>
                            <div
                              style={{
                                height: '100%',
                                backgroundColor: '#0066FF',
                                borderRadius: '3px',
                                width: 
                                  proj.status === 'ONBOARDING' ? '15%' :
                                  proj.status === 'IN_PROGRESS' ? '50%' :
                                  proj.status === 'REVIEW' ? '80%' :
                                  proj.status === 'DELIVERED' ? '100%' : '0%'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                          <div>
                            <h5 style={{ margin: '0 0 8px', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Services Scope:</h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {proj.services.map((s, idx) => (
                                <span key={idx} style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '4px', fontWeight: 500 }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {proj.notes && (
                            <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #0066FF' }}>
                              <h5 style={{ margin: '0 0 6px', fontSize: '12px', color: '#0A0A0A', fontWeight: 700 }}>Advisor Notes:</h5>
                              <p style={{ margin: 0, fontSize: '12px', color: '#4B5563', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{proj.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
