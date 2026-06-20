import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, Upload, Check } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface PortfolioProject {
  id: string
  clientName: string
  category: string
  services: string[]
  result: string
  imageUrl: string
  color: string | null
}

export function AdminPortfolio() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  // Creation/Editing Form Fields
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [category, setCategory] = useState('Branding')
  const [servicesInput, setServicesInput] = useState('')
  const [result, setResult] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [color, setColor] = useState('#0066FF')
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`)
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageBase64) {
      alert('Please upload a cover image.')
      return
    }

    setSubmitLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          category,
          services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
          result,
          imageBase64,
          color
        })
      })

      if (res.ok) {
        const data = await res.json()
        setProjects(prev => [data.project, ...prev])
        setNewProjectOpen(false)
        resetForm()
      } else {
        alert('Failed to upload portfolio project.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    setSubmitLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/projects/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          category,
          services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
          result,
          color
        })
      })

      if (res.ok) {
        const data = await res.json()
        setProjects(prev => prev.map(p => p.id === editingId ? data.project : p))
        setEditingId(null)
        resetForm()
      } else {
        alert('Failed to update project.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this case study from the portfolio? This will remove the image from Cloudinary.')) {
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    setClientName('')
    setCategory('Branding')
    setServicesInput('')
    setResult('')
    setImageBase64(null)
    setColor('#0066FF')
  }

  const startEdit = (p: PortfolioProject) => {
    setEditingId(p.id)
    setClientName(p.clientName)
    setCategory(p.category)
    setServicesInput(p.services.join(', '))
    setResult(p.result)
    setColor(p.color || '#0066FF')
    setNewProjectOpen(true)
  }

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
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Portfolio Projects</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Add, edit, or delete work experience displays shown in the case studies gallery.</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null)
            resetForm()
            setNewProjectOpen(true)
          }}
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
          <span>Add Case Study</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {projects.map(proj => (
          <div key={proj.id} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
              <img src={proj.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#000', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {proj.category}
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>{proj.clientName}</h4>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>"{proj.result}"</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '20px' }}>
                  {proj.services.map((s, idx) => (
                    <span key={idx} style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '14px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: proj.color || '#0066FF' }} title="Branding Accent Color" />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => startEdit(proj)} style={{ background: 'none', border: 'none', color: '#0066FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><Edit2 size={14} /> Edit</button>
                  <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {newProjectOpen && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form
            onSubmit={editingId ? handleUpdateProject : handleCreateProject}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              padding: '36px',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{editingId ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}</h3>
              <button type="button" onClick={() => setNewProjectOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Client / Brand Name</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Nexis Marketing" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}>
                  <option value="Branding">Branding</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Content">Content</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Result Highlight</label>
              <input type="text" value={result} onChange={e => setResult(e.target.value)} placeholder="e.g. 340% increase in brand recall within 3 months" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Services Scope (comma-separated)</label>
              <input type="text" value={servicesInput} onChange={e => setServicesInput(e.target.value)} placeholder="e.g. Brand Identity, Logo Design, Typography" required style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Branding Accent Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '36px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
              </div>

              {!editingId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '6px', justifyContent: 'center' }}>
                    <Upload size={14} />
                    <span>Upload Cover</span>
                    <input type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} required />
                  </label>
                </div>
              )}
            </div>

            {imageBase64 && (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px', height: '100px', display: 'flex', justifyContent: 'center' }}>
                <img src={imageBase64} alt="" style={{ height: '100%', borderRadius: '4px' }} />
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading}
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
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitLoading ? (
                <div className="login-spinner" style={{ border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></div>
              ) : (
                <>
                  <Check size={16} />
                  <span>{editingId ? 'Save Changes' : 'Upload Portfolio Card'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
