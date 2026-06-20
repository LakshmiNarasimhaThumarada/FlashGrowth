import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface ClientProject {
  id: string
  clientName: string
  companyName: string | null
  email: string
  status: 'ONBOARDING' | 'IN_PROGRESS' | 'REVIEW' | 'DELIVERED' | 'PAUSED' | 'CANCELLED'
  notes: string | null
  totalQuote: number
  services: string[]
  createdAt: string
  updatedAt: string
  inquiryId: string | null
}

interface PendingInquiry {
  id: string
  fullName: string
  companyName: string | null
  email: string
  totalQuote: number
  selectedServices: Array<{ name: string; price: number }>
  createdAt: string
}

export function AdminClients() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [inquiries, setInquiries] = useState<PendingInquiry[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal / Sidebar panel details
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null)
  const [projectNotes, setProjectNotes] = useState('')
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  // Manual Creation Fields
  const [clientName, setClientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [totalQuote, setTotalQuote] = useState(0)
  const [servicesInput, setServicesInput] = useState('')

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      const [projRes, inqRes] = await Promise.all([
        fetch(`${API_URL}/api/client-projects`, { headers }),
        fetch(`${API_URL}/api/inquiries`, { headers })
      ])

      if (projRes.ok) {
        const data = await projRes.json()
        setProjects(data)
      }

      if (inqRes.ok) {
        const data = await inqRes.json()
        // Filter inquiries that do not already have an active client project
        const activeInqIds = projects.map(p => p.inquiryId).filter(Boolean)
        const pending = data.filter((i: any) => i.status !== 'CLOSED' && !activeInqIds.includes(i.id))
        setInquiries(pending)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadData()
  }, [token])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/client-projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p))
        if (selectedProject?.id === id) {
          setSelectedProject(prev => prev ? { ...prev, status: newStatus as any } : null)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedProject) return
    try {
      const res = await fetch(`${API_URL}/api/client-projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes: projectNotes })
      })

      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, notes: projectNotes } : p))
        setSelectedProject(prev => prev ? { ...prev, notes: projectNotes } : null)
        alert('Notes updated successfully.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const convertInquiryToProject = async (inqId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/client-projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ inquiryId: inqId })
      })

      if (res.ok) {
        loadData() // Refresh whole grid and pipeline
        setNewProjectOpen(false)
      } else {
        alert('Failed to convert inquiry to project.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateProjectManual = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/client-projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          companyName: companyName || null,
          email,
          totalQuote: Number(totalQuote),
          services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
          status: 'ONBOARDING'
        })
      })

      if (res.ok) {
        loadData()
        setNewProjectOpen(false)
        setClientName('')
        setCompanyName('')
        setEmail('')
        setTotalQuote(0)
        setServicesInput('')
      } else {
        alert('Failed to create project.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteProject = async (id: string) => {
    if (!window.confirm('Delete this client project from operations tracker?')) return
    try {
      const res = await fetch(`${API_URL}/api/client-projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id))
        setSelectedProject(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    { label: 'Onboarding', status: 'ONBOARDING', color: '#8B5CF6' },
    { label: 'In Progress', status: 'IN_PROGRESS', color: '#0066FF' },
    { label: 'Review / QA', status: 'REVIEW', color: '#D97706' },
    { label: 'Delivered', status: 'DELIVERED', color: '#059669' }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="login-spinner" style={{ border: '3px solid #E5E7EB', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Client CRM Board</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Track ongoing client projects, manage work statuses, and edit advisor reports.</p>
        </div>

        <button
          onClick={() => setNewProjectOpen(true)}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Add Client Project</span>
        </button>
      </div>

      {/* Kanban Board Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', minHeight: '60vh', alignItems: 'start' }}>
        {columns.map(col => {
          const colProjects = projects.filter(p => p.status === col.status)
          return (
            <div key={col.status} style={{ backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '16px', minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Column Label */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{col.label}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#E5E7EB', color: '#4B5563', padding: '2px 8px', borderRadius: '20px' }}>{colProjects.length}</span>
              </div>

              {/* Column Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colProjects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj)
                      setProjectNotes(proj.notes || '')
                    }}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>{proj.companyName || 'Indie Client'}</span>
                    <h4 style={{ margin: '4px 0 8px', fontSize: '14px', fontWeight: 700, color: '#0A0A0A' }}>{proj.clientName}</h4>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {proj.services.slice(0, 2).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '4px' }}>{s}</span>
                      ))}
                      {proj.services.length > 2 && <span style={{ fontSize: '10px', color: '#9CA3AF', padding: '2px' }}>+{proj.services.length - 2}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{new Date(proj.createdAt).toLocaleDateString()}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF' }}>${proj.totalQuote.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Side Detail Sidebar Panel (when card clicked) */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100 }} onClick={() => setSelectedProject(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                right: 0,
                width: '460px',
                backgroundColor: '#fff',
                zIndex: 1101,
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '36px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>CLIENT PROJECT CRM</span>
                  <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}><X size={20} /></button>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0A0A0A', margin: '0 0 4px' }}>{selectedProject.clientName}</h3>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{selectedProject.companyName || 'Individual Contract'}</span>

                <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>Email Address</span>
                    <span style={{ fontWeight: 600 }}>{selectedProject.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>Contract Value</span>
                    <span style={{ fontWeight: 700, color: '#0066FF' }}>${selectedProject.totalQuote.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>Operations Status</span>
                    <select
                      value={selectedProject.status}
                      onChange={(e) => handleUpdateStatus(selectedProject.id, e.target.value)}
                      style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', fontWeight: 600 }}
                    >
                      <option value="ONBOARDING">Onboarding</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review / QA</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '28px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Services Under Contract:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedProject.services.map((s, idx) => (
                      <span key={idx} style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Operations Notes editing area */}
                <div style={{ marginTop: '28px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Advisor Report / Client Updates:</h4>
                  <textarea
                    rows={6}
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    placeholder="Enter project updates, checklist completion logs, or onboarding instructions. These notes are visible to the client."
                    style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
                  />
                  <button
                    onClick={handleSaveNotes}
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Save Notes & Push to Client
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => deleteProject(selectedProject.id)}
                  style={{
                    backgroundColor: '#FEF2F2',
                    color: '#EF4444',
                    border: '1px solid #FCA5A5',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Client Project Panel overlay (from inquiries or manual) */}
      <AnimatePresence>
        {newProjectOpen && (
          <>
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100 }} onClick={() => setNewProjectOpen(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                right: 0,
                width: '480px',
                backgroundColor: '#fff',
                zIndex: 1101,
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                padding: '36px',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Add New Client Project</h3>
                <button onClick={() => setNewProjectOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}><X size={20} /></button>
              </div>

              {/* Conversion from existing inquiries list */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Convert Pending Proposal Inquiries:</h4>
                {inquiries.length === 0 ? (
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>
                    Zero unconverted inquiries available.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {inquiries.map(inq => (
                      <div key={inq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a', display: 'block' }}>{inq.fullName}</span>
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>{inq.companyName || inq.email} — ${inq.totalQuote}</span>
                        </div>
                        <button
                          onClick={() => convertInquiryToProject(inq.id)}
                          style={{
                            backgroundColor: '#0066FF',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Convert
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Or manual creation form */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: '0 0 16px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>Or Create Custom Project:</h4>
                <form onSubmit={handleCreateProjectManual} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Client Name</label>
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Arjun Mehta" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Client Email (for status updates)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. arjun@acmecorp.in" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Contract Value ($)</label>
                    <input type="number" value={totalQuote || ''} onChange={e => setTotalQuote(Number(e.target.value))} placeholder="e.g. 5000" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Assigned Services (comma-separated)</label>
                    <input type="text" value={servicesInput} onChange={e => setServicesInput(e.target.value)} placeholder="e.g. Paid Ads, SEO Optimization" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '10px',
                      fontSize: '13px'
                    }}
                  >
                    Create Custom Project
                  </button>
                </form>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
