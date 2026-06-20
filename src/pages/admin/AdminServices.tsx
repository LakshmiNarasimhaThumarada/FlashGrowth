import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface ServiceItem {
  id: string
  slug: string
  name: string
  description: string
  price: number
}

interface ServicePack {
  id: string
  slug: string
  title: string
  description: string
  tagline: string
  iconName: string
  order: number
  visible: boolean
  services: ServiceItem[]
}

export function AdminServices() {
  const { token } = useAuth()
  const [packs, setPacks] = useState<ServicePack[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPack, setExpandedPack] = useState<string | null>(null)

  // Forms states
  const [editingPackId, setEditingPackId] = useState<string | null>(null)
  const [editPackTitle, setEditPackTitle] = useState('')
  const [editPackDesc, setEditPackDesc] = useState('')
  const [editPackTagline, setEditPackTagline] = useState('')
  const [editPackIcon, setEditPackIcon] = useState('')

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editItemName, setEditItemName] = useState('')
  const [editItemDesc, setEditItemDesc] = useState('')
  const [editItemPrice, setEditItemPrice] = useState(0)

  // New Pack Form
  const [newPackOpen, setNewPackOpen] = useState(false)
  const [newPackTitle, setNewPackTitle] = useState('')
  const [newPackDesc, setNewPackDesc] = useState('')
  const [newPackTagline, setNewPackTagline] = useState('')
  const [newPackIcon, setNewPackIcon] = useState('Briefcase')
  const [newPackSlug, setNewPackSlug] = useState('')

  // New Item Form
  const [newItemOpenPackId, setNewItemOpenPackId] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemPrice, setNewItemPrice] = useState(0)
  const [newItemSlug, setNewItemSlug] = useState('')

  const loadServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services`)
      if (res.ok) {
        const data = await res.json()
        setPacks(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  // Sort Packs UP / DOWN
  const movePack = async (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1
    if (nextIdx < 0 || nextIdx >= packs.length) return

    const updated = [...packs]
    const temp = updated[index]
    updated[index] = updated[nextIdx]
    updated[nextIdx] = temp

    // Locally swap
    setPacks(updated)

    // Save order changes to DB
    try {
      await Promise.all([
        fetch(`${API_URL}/api/services/packs/${updated[index].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: index })
        }),
        fetch(`${API_URL}/api/services/packs/${updated[nextIdx].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: nextIdx })
        })
      ])
    } catch (err) {
      console.error(err)
    }
  }

  // Toggle Visibility
  const toggleVisibility = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/services/packs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visible: !currentVal })
      })
      if (res.ok) {
        setPacks(prev => prev.map(p => p.id === id ? { ...p, visible: !currentVal } : p))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Save Pack updates
  const savePackEdit = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/services/packs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editPackTitle,
          description: editPackDesc,
          tagline: editPackTagline,
          iconName: editPackIcon
        })
      })

      if (res.ok) {
        setPacks(prev => prev.map(p => p.id === id ? {
          ...p,
          title: editPackTitle,
          description: editPackDesc,
          tagline: editPackTagline,
          iconName: editPackIcon
        } : p))
        setEditingPackId(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Delete Pack
  const deletePack = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service pack? All containing service items will be permanently deleted.')) {
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/services/packs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setPacks(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Add Pack
  const handleAddPack = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/services/packs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newPackTitle,
          description: newPackDesc,
          tagline: newPackTagline,
          iconName: newPackIcon,
          slug: newPackSlug || newPackTitle.toLowerCase().replace(/\s+/g, '-')
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPacks(prev => [...prev, { ...data.pack, services: [] }])
        setNewPackOpen(false)
        setNewPackTitle('')
        setNewPackDesc('')
        setNewPackTagline('')
        setNewPackSlug('')
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to create pack')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Add Service Item
  const handleAddItem = async (e: React.FormEvent, packId: string) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/services/packs/${packId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          price: newItemPrice,
          slug: newItemSlug || newItemName.toLowerCase().replace(/\s+/g, '-')
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPacks(prev => prev.map(p => p.id === packId ? { ...p, services: [...p.services, data.item] } : p))
        setNewItemOpenPackId(null)
        setNewItemName('')
        setNewItemDesc('')
        setNewItemPrice(0)
        setNewItemSlug('')
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to add service item')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Save Service Item edits
  const saveItemEdit = async (id: string, packId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/services/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editItemName,
          description: editItemDesc,
          price: editItemPrice
        })
      })

      if (res.ok) {
        setPacks(prev => prev.map(p => p.id === packId ? {
          ...p,
          services: p.services.map(i => i.id === id ? { ...i, name: editItemName, description: editItemDesc, price: editItemPrice } : i)
        } : p))
        setEditingItemId(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Delete Service Item
  const deleteItem = async (id: string, packId: string) => {
    if (!window.confirm('Delete this service item?')) return

    try {
      const res = await fetch(`${API_URL}/api/services/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setPacks(prev => prev.map(p => p.id === packId ? { ...p, services: p.services.filter(i => i.id !== id) } : p))
      }
    } catch (err) {
      console.error(err)
    }
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
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Services Editor</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Add, edit, customize service packs and price quotes dynamically.</p>
        </div>

        <button
          onClick={() => setNewPackOpen(!newPackOpen)}
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
          <span>New Service Pack</span>
        </button>
      </div>

      {/* Add New Pack Form Box */}
      {newPackOpen && (
        <form onSubmit={handleAddPack} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Add Service Pack Card</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Pack Name</label>
              <input type="text" value={newPackTitle} onChange={e => setNewPackTitle(e.target.value)} placeholder="e.g. SEO Campaign Pack" required style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Slug ID (Unique String)</label>
              <input type="text" value={newPackSlug} onChange={e => setNewPackSlug(e.target.value)} placeholder="e.g. seo-pack" style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Description</label>
              <input type="text" value={newPackDesc} onChange={e => setNewPackDesc(e.target.value)} placeholder="Transform search traffic and analytics details..." required style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Sub-Tagline</label>
              <input type="text" value={newPackTagline} onChange={e => setNewPackTagline(e.target.value)} placeholder="Custom campaign strategy and optimization plans" style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Icon Component Name</label>
              <select value={newPackIcon} onChange={e => setNewPackIcon(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px' }}>
                <option value="Briefcase">Briefcase</option>
                <option value="Megaphone">Megaphone</option>
                <option value="Video">Video</option>
                <option value="TrendingUp">TrendingUp</option>
                <option value="Activity">Activity</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={() => setNewPackOpen(false)} style={{ background: 'none', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ backgroundColor: '#0066FF', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Create Pack</button>
          </div>
        </form>
      )}

      {/* Accordion list of packs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {packs.map((pack, idx) => {
          const isExpanded = expandedPack === pack.id
          const isEditing = editingPackId === pack.id
          return (
            <div key={pack.id} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              
              {/* Header Box */}
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isExpanded ? '1px solid #F3F4F6' : 'none' }}>
                
                {/* Title & Info */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
                      <input type="text" value={editPackTitle} onChange={e => setEditPackTitle(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }} />
                      <input type="text" value={editPackDesc} onChange={e => setEditPackDesc(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                      <input type="text" value={editPackTagline} onChange={e => setEditPackTagline(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0A0A0A' }}>{pack.title}</h3>
                        {!pack.visible && <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>HIDDEN</span>}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{pack.description}</p>
                    </div>
                  )}
                </div>

                {/* Operations Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
                  
                  {/* Sorting Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => movePack(idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }}><ChevronUp size={16} /></button>
                    <button onClick={() => movePack(idx, 'down')} disabled={idx === packs.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }}><ChevronDown size={16} /></button>
                  </div>

                  {/* Toggle Visible */}
                  <button onClick={() => toggleVisibility(pack.id, pack.visible)} style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: '4px' }} title={pack.visible ? 'Hide pack' : 'Make visible'}>
                    {pack.visible ? <Eye size={18} /> : <EyeOff size={18} style={{ color: '#9CA3AF' }} />}
                  </button>

                  {/* Edit Pack Info */}
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => savePackEdit(pack.id)} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Check size={14} /></button>
                      <button onClick={() => setEditingPackId(null)} style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPackId(pack.id)
                        setEditPackTitle(pack.title)
                        setEditPackDesc(pack.description)
                        setEditPackTagline(pack.tagline)
                        setEditPackIcon(pack.iconName)
                      }}
                      style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit2 size={18} />
                    </button>
                  )}

                  {/* Delete Pack */}
                  <button onClick={() => deletePack(pack.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={18} />
                  </button>

                  {/* Accordion Toggle */}
                  <button
                    onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4B5563',
                      cursor: 'pointer',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      padding: '4px'
                    }}
                  >
                    <ChevronDown size={20} />
                  </button>

                </div>

              </div>

              {/* Containing services items list */}
              {isExpanded && (
                <div style={{ padding: '24px', backgroundColor: '#FAFAFA' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151' }}>Service Items ({pack.services.length})</h5>
                    <button
                      onClick={() => setNewItemOpenPackId(pack.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #D1D5DB',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}
                    >
                      <Plus size={12} />
                      <span>Add Service Item</span>
                    </button>
                  </div>

                  {/* Add Service Item Form */}
                  {newItemOpenPackId === pack.id && (
                    <form onSubmit={(e) => handleAddItem(e, pack.id)} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: '12px' }}>
                        <input type="text" placeholder="Service Name (e.g. GA4 Setup)" value={newItemName} onChange={e => setNewItemName(e.target.value)} required style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                        <input type="number" placeholder="Price ($)" value={newItemPrice || ''} onChange={e => setNewItemPrice(Number(e.target.value))} required style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                        <input type="text" placeholder="Slug (unique)" value={newItemSlug} onChange={e => setNewItemSlug(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                      <input type="text" placeholder="Brief service details & specifications..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} required style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setNewItemOpenPackId(null)} style={{ padding: '4px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', background: 'none' }}>Cancel</button>
                        <button type="submit" style={{ padding: '4px 10px', backgroundColor: '#0066FF', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Add Item</button>
                      </div>
                    </form>
                  )}

                  {/* List items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pack.services.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '12px' }}>Zero service items currently configured.</div>
                    ) : (
                      pack.services.map(service => {
                        const isEditingItem = editingItemId === service.id
                        return (
                          <div key={service.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                            <div style={{ flex: 1 }}>
                              {isEditingItem ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
                                  <input type="text" value={editItemName} onChange={e => setEditItemName(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }} />
                                  <input type="text" value={editItemDesc} onChange={e => setEditItemDesc(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px' }} />
                                </div>
                              ) : (
                                <div>
                                  <span style={{ fontWeight: 600, color: '#374151', fontSize: '13px' }}>{service.name}</span>
                                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{service.description}</p>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '24px' }}>
                              
                              {/* Price */}
                              {isEditingItem ? (
                                <input type="number" value={editItemPrice} onChange={e => setEditItemPrice(Number(e.target.value))} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '13px', width: '100px' }} />
                              ) : (
                                <span style={{ fontWeight: 700, color: '#0066FF', fontSize: '14px' }}>${service.price.toLocaleString()}</span>
                              )}

                              {/* Operations */}
                              {isEditingItem ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => saveItemEdit(service.id, pack.id)} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Check size={12} /></button>
                                  <button onClick={() => setEditingItemId(null)} style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><X size={12} /></button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingItemId(service.id)
                                    setEditItemName(service.name)
                                    setEditItemDesc(service.description)
                                    setEditItemPrice(service.price)
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', padding: '4px' }}
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}

                              <button onClick={() => deleteItem(service.id, pack.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                                <Trash2 size={14} />
                              </button>

                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                </div>
              )}

            </div>
          )
        })}
      </div>
    </div>
  )
}
