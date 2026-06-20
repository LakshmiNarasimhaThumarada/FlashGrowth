import { useState, useEffect } from 'react'
import { Search, Shield, User, Trash2 } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

interface Member {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  lastLogin: string | null
  createdAt: string
}

export function AdminMembers() {
  const { token, user: currentUser } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/members?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [search])

  const toggleUserRole = async (id: string, currentRole: 'USER' | 'ADMIN') => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    
    // Prevent self-demotion
    if (id === currentUser?.id) {
      alert('You cannot demote your own administrator account.')
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/members/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      })

      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: nextRole } : m))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own account.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this user? This will remove all associated database references.')) {
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Member Accounts</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Manage customer user registrations and promote administrator credentials.</p>
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
              backgroundColor: '#fff'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div className="login-spinner" style={{ border: '3px solid #E5E7EB', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Member Profile</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Last Login</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 24px', textAlign: 'center', color: '#9CA3AF' }}>No registered members found matching search parameters.</td>
                </tr>
              ) : (
                members.map(member => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    
                    {/* User Avatar + Email Details */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0066FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                            {member.fullName?.charAt(0) || member.email.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: 600, color: '#0A0A0A', display: 'block' }}>{member.fullName || 'No Name'}</span>
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>{member.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badging */}
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '30px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: member.role === 'ADMIN' ? '#F4F7FF' : '#F3F4F6',
                          color: member.role === 'ADMIN' ? '#0066FF' : '#4B5563'
                        }}
                      >
                        {member.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                        <span>{member.role}</span>
                      </span>
                    </td>

                    {/* Join Date */}
                    <td style={{ padding: '16px 24px', color: '#6B7280' }}>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '16px 24px', color: '#6B7280' }}>
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                          onClick={() => toggleUserRole(member.id, member.role)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0066FF',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                          disabled={member.id === currentUser?.id}
                        >
                          {member.role === 'ADMIN' ? 'Demote User' : 'Make Admin'}
                        </button>
                        
                        <button
                          onClick={() => deleteUser(member.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                          }}
                          disabled={member.id === currentUser?.id}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
