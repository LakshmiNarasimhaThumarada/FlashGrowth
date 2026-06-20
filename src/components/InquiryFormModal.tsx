import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Smartphone, Mail, User, Building2, FileText, ArrowRight } from 'lucide-react'
import { useAuth, API_URL } from '../context/AuthContext'

interface SelectedServiceSummary {
  id: string
  name: string
  price: number
}

interface InquiryFormModalProps {
  isOpen: boolean
  onClose: () => void
  selectedServices: SelectedServiceSummary[]
}

interface FormFields {
  fullName: string
  mobileNumber: string
  email: string
  businessType: 'B2B' | 'B2C' | 'Both'
  companyName: string
  projectDescription: string
}

export function InquiryFormModal({
  isOpen,
  onClose,
  selectedServices,
}: InquiryFormModalProps) {
  const { token, user } = useAuth()
  const [fields, setFields] = useState<FormFields>({
    fullName: '',
    mobileNumber: '',
    email: '',
    businessType: 'B2B',
    companyName: '',
    projectDescription: '',
  })

  // Prefill user details if logged in
  useEffect(() => {
    if (isOpen && user) {
      setFields((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isOpen, user])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleBusinessTypeChange = (type: 'B2B' | 'B2C' | 'Both') => {
    setFields((prev) => ({ ...prev, businessType: type }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Full name validation
    if (!fields.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (fields.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Mobile validation
    const mobileRegex = /^[+]?[0-9]{10,14}$/
    if (!fields.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!mobileRegex.test(fields.mobileNumber.trim().replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number (10 to 14 digits)'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!fields.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!emailRegex.test(fields.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    // Project description validation
    if (!fields.projectDescription.trim()) {
      newErrors.projectDescription = 'Description is required'
    } else if (fields.projectDescription.trim().length < 10) {
      newErrors.projectDescription = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        fullName: fields.fullName,
        mobileNumber: fields.mobileNumber,
        email: fields.email,
        businessType: fields.businessType,
        companyName: fields.companyName || null,
        projectDescription: fields.projectDescription,
        services: selectedServices.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price
        }))
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to submit inquiry')
      }

      setIsSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setSubmitError(null)
    setFields({
      fullName: '',
      mobileNumber: '',
      email: '',
      businessType: 'B2B',
      companyName: '',
      projectDescription: '',
    })
    setErrors({})
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
          />

          {/* Modal Wrapper */}
          <div className="modal-wrapper">
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {/* Close Button */}
              <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
                <X size={20} />
              </button>

              {!isSubmitted ? (
                <div className="modal-content-split">
                  {/* Left Column: Form Info & Services Summary */}
                  <div className="modal-sidebar">
                    <span className="sidebar-tag">Selected Plan</span>
                    <h3 className="sidebar-title">Plan Summary</h3>
                    
                    <div className="selected-services-box">
                      {selectedServices.length === 0 ? (
                        <p className="no-services-text">No services selected.</p>
                      ) : (
                        <div className="sidebar-services-list">
                          {selectedServices.map((service) => (
                            <div key={service.id} className="sidebar-service-item">
                              <span className="item-name">{service.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="guarantee-box">
                      <div className="guarantee-icon-dot" />
                      <div>
                        <h4>Fast Callback Promise</h4>
                        <p>Our growth advisor will call or email you within 2 business hours.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Form */}
                  <div className="modal-form-area">
                    <div className="form-header">
                      <h3>Finalize Your Inquiry</h3>
                      <p>Tell us a bit about your brand, and we will get back to you with custom strategy insights.</p>
                    </div>

                    {submitError && (
                      <div className="login-error-alert font-sans" style={{ margin: '0 0 16px', backgroundColor: '#FFF5F5', color: '#E53E3E', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', border: '1px solid #FED7D7' }}>
                        {submitError}
                      </div>
                    )}

                    <form onSubmit={onSubmit} className="inquiry-form">
                      {/* Full Name */}
                      <div className="form-group">
                        <label htmlFor="fullName">
                          <User size={14} />
                          <span>Full Name *</span>
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fields.fullName}
                          onChange={handleInputChange}
                          className={errors.fullName ? 'input-error' : ''}
                        />
                        {errors.fullName && (
                          <span className="error-message">{errors.fullName}</span>
                        )}
                      </div>

                      {/* Contact Fields Side-by-Side */}
                      <div className="form-row">
                        {/* Mobile Number */}
                        <div className="form-group">
                          <label htmlFor="mobileNumber">
                            <Smartphone size={14} />
                            <span>Mobile Number *</span>
                          </label>
                          <input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={fields.mobileNumber}
                            onChange={handleInputChange}
                            className={errors.mobileNumber ? 'input-error' : ''}
                          />
                          {errors.mobileNumber && (
                            <span className="error-message">{errors.mobileNumber}</span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                          <label htmlFor="email">
                            <Mail size={14} />
                            <span>Gmail / Email *</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@gmail.com"
                            value={fields.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'input-error' : ''}
                          />
                          {errors.email && (
                            <span className="error-message">{errors.email}</span>
                          )}
                        </div>
                      </div>

                      {/* Company Name & Business Type Row */}
                      <div className="form-row">
                        {/* Company Name */}
                        <div className="form-group">
                          <label htmlFor="companyName">
                            <Building2 size={14} />
                            <span>Company Name</span>
                          </label>
                          <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            placeholder="e.g. Flash Corp"
                            value={fields.companyName}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Business Type */}
                        <div className="form-group">
                          <label>Business Type *</label>
                          <div className="radio-group">
                            {(['B2B', 'B2C', 'Both'] as const).map((type) => (
                              <label key={type} className="radio-label">
                                <input
                                  type="radio"
                                  name="businessType"
                                  value={type}
                                  checked={fields.businessType === type}
                                  onChange={() => handleBusinessTypeChange(type)}
                                />
                                <span className="custom-radio" />
                                <span>{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Project Description */}
                      <div className="form-group">
                        <label htmlFor="projectDescription">
                          <FileText size={14} />
                          <span>Brief Project Description *</span>
                        </label>
                        <textarea
                          id="projectDescription"
                          name="projectDescription"
                          rows={3}
                          placeholder="Briefly explain your primary goals, challenges, and target audience..."
                          value={fields.projectDescription}
                          onChange={handleInputChange}
                          className={errors.projectDescription ? 'input-error' : ''}
                        />
                        {errors.projectDescription && (
                          <span className="error-message">{errors.projectDescription}</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="form-submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="loader-dots">Processing...</span>
                        ) : (
                          <>
                            <span>Request Growth Consultation</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Thank You Screen */
                <motion.div
                  className="thank-you-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="thank-you-icon-wrapper">
                    <CheckCircle size={64} className="success-check-icon" />
                  </div>
                  
                  <h2 className="thank-you-title">Thank You, {fields.fullName}!</h2>
                  <p className="thank-you-message">
                    Your growth strategy request has been submitted successfully. A senior marketing advisor from <strong>Flash Growth</strong> will contact you at <strong>{fields.mobileNumber}</strong> or via <strong>{fields.email}</strong>.
                  </p>

                  <div className="thank-you-summary-box">
                    <div className="summary-section-title">Inquiry Details</div>
                    <div className="summary-data-row">
                      <span className="summary-data-label">Selected Services:</span>
                      <span className="summary-data-val">{selectedServices.length} Items</span>
                    </div>
                    <div className="summary-data-row">
                      <span className="summary-data-label">Business Model:</span>
                      <span className="summary-data-val">{fields.businessType}</span>
                    </div>
                  </div>

                  <button className="thank-you-close-btn" onClick={handleClose}>
                    Return to Landing Page
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
