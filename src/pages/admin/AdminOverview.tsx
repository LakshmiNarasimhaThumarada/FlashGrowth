import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, DollarSign, Briefcase } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface RecentInquiry {
  id: string
  fullName: string
  email: string
  companyName: string | null
  businessType: string
  totalQuote: number
  status: 'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'
  createdAt: string
}

interface StatsData {
  inquiries: {
    total: number
    pending: number
    inProgress: number
    closed: number
    conversionRate: number
  }
  revenue: {
    totalCollected: number
  }
  projects: {
    total: number
  }
  members: {
    total: number
  }
  recentInquiries: RecentInquiry[]
}

export function AdminOverview() {
  const { token } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const loadStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('[Load Stats Error]:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [token])

  const handleInquiryStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        // Refresh local stats state
        setStats(prev => {
          if (!prev) return null
          return {
            ...prev,
            recentInquiries: prev.recentInquiries.map(inq => 
              inq.id === id ? { ...inq, status: newStatus as any } : inq
            )
          }
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }
      case 'CONTACTED':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
      default:
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' }
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="login-spinner" style={{ border: '3px solid #E5E7EB', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Dashboard Summary</h2>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time business performance metrics and active operations logs.</p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>Total Members</span>
            <Users size={20} style={{ color: '#0066FF' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{stats?.members.total}</h3>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>Proposal Requests</span>
            <FileText size={20} style={{ color: '#0066FF' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{stats?.inquiries.total}</h3>
          <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginTop: '6px' }}>{stats?.inquiries.pending} requests pending response</span>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>Active Projects</span>
            <Briefcase size={20} style={{ color: '#0066FF' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{stats?.projects.total}</h3>
          <span style={{ fontSize: '11px', color: '#059669', display: 'block', marginTop: '6px', fontWeight: 600 }}>{stats?.inquiries.conversionRate}% closure rate</span>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>Revenue Collected</span>
            <DollarSign size={20} style={{ color: '#0066FF' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>${stats?.revenue.totalCollected.toLocaleString()}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Recent Inquiries Panel */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
          <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>Recent Inquiries</h4>
          {stats?.recentInquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '13px' }}>
              No incoming leads yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', textAlign: 'left', color: '#6B7280' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Quote</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>CRM Status</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentInquiries.map(inq => {
                    const colors = getStatusColor(inq.status)
                    return (
                      <tr key={inq.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px 8px' }}>
                          <span style={{ fontWeight: 600, color: '#0A0A0A', display: 'block' }}>{inq.fullName}</span>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{inq.companyName || 'No Company'}</span>
                        </td>
                        <td style={{ padding: '14px 8px', fontWeight: 600 }}>${inq.totalQuote.toLocaleString()}</td>
                        <td style={{ padding: '14px 8px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: colors.bg, color: colors.text, fontSize: '11px', fontWeight: 700 }}>
                            {inq.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <select
                            value={inq.status}
                            onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #D1D5DB',
                              fontSize: '12px',
                              backgroundColor: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="IN_PROGRESS">Active Work</option>
                            <option value="CLOSED">Closed/Converted</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic SVG Analytics Chart & CRM Pipeline Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Custom SVG Trend Chart */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>Inquiry Lead Trends</h4>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6B7280' }}>Visual chart detailing lead volumes over the past 5 weeks.</p>
            
            {/* Custom SVG Bar Chart */}
            <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', position: 'relative' }}>
              
              {/* Background grid lines */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '25%', borderBottom: '1px dashed #E5E7EB' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '50%', borderBottom: '1px dashed #E5E7EB' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '75%', borderBottom: '1px dashed #E5E7EB' }} />

              {/* Weekly mock bars representing weekly volumes */}
              {[
                { week: 'Wk 1', count: 12 },
                { week: 'Wk 2', count: 18 },
                { week: 'Wk 3', count: 15 },
                { week: 'Wk 4', count: 24 },
                { week: 'Wk 5', count: stats?.inquiries.total || 32 }
              ].map((item, idx) => {
                const maxVal = 40
                const heightPercent = `${(item.count / maxVal) * 100}%`
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>{item.count}</span>
                    <div
                      style={{
                        width: '32px',
                        height: '100px', // bounding container
                        backgroundColor: '#F3F4F6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        overflow: 'hidden'
                      }}
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: heightPercent }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        style={{
                          width: '100%',
                          backgroundColor: idx === 4 ? '#0066FF' : '#0A0A0A',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', fontWeight: 600 }}>{item.week}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CRM Pipeline breakdown widgets */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
            <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>CRM Funnel Progress</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#4B5563' }}>Pending Requests ({stats?.inquiries.pending})</span>
                  <span style={{ color: '#000' }}>
                    {stats?.inquiries.total ? Math.round(((stats.inquiries.pending) / stats.inquiries.total) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px' }}>
                  <div style={{ height: '100%', backgroundColor: '#D1D5DB', borderRadius: '3px', width: `${stats?.inquiries.total ? (stats.inquiries.pending / stats.inquiries.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#0066FF' }}>Active Converted Clients ({stats?.projects.total})</span>
                  <span style={{ color: '#000' }}>
                    {stats?.inquiries.total ? Math.round(((stats.projects.total) / stats.inquiries.total) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px' }}>
                  <div style={{ height: '100%', backgroundColor: '#0066FF', borderRadius: '3px', width: `${stats?.inquiries.total ? (stats.projects.total / stats.inquiries.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
