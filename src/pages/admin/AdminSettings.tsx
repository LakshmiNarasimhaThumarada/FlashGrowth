import { useState, useEffect } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { useAuth, API_URL } from '../../context/AuthContext'

export function AdminSettings() {
  const { token } = useAuth()
  const [stripePublicKey, setStripePublicKey] = useState('')
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`)
        if (res.ok) {
          const data = await res.json()
          setStripePublicKey(data.stripePublicKey || '')
          setRazorpayKeyId(data.razorpayKeyId || '')
          setContactEmail(data.contactEmail || '')
          setContactPhone(data.contactPhone || '')
          setContactAddress(data.contactAddress || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stripePublicKey,
          razorpayKeyId,
          contactEmail,
          contactPhone,
          contactAddress
        })
      })

      if (res.ok) {
        alert('Settings updated successfully. Office details will sync across public components.')
      } else {
        alert('Failed to save settings.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <div className="login-spinner" style={{ border: '3px solid #E5E7EB', borderTop: '3px solid #0066FF', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>Site Settings</h2>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Configure integrations keys and company details that reflect globally across pages.</p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Payment Gateways Config */}
        <div>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#0A0A0A' }}>Payment Integrations Keys</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Stripe Publishable Key (USD Gateway)</label>
              <input
                type="text"
                placeholder="pk_test_..."
                value={stripePublicKey}
                onChange={e => setStripePublicKey(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Razorpay Key ID (INR Gateway)</label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={razorpayKeyId}
                onChange={e => setRazorpayKeyId(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', width: '100%', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: 0 }} />

        {/* Global Company/Office Details */}
        <div>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#0A0A0A' }}>Office Address & Contact Info</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Office Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="marketing@flashgrowth.com"
                  required
                  style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Office Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  required
                  style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Office Address</label>
              <input
                type="text"
                value={contactAddress}
                onChange={e => setContactAddress(e.target.value)}
                placeholder="100 Pine St, San Francisco, CA"
                required
                style={{ padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Saving Configurations...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Configurations</span>
            </>
          )}
        </button>

      </form>
    </div>
  )
}
