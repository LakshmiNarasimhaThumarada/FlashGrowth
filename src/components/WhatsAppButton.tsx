import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)
  const phoneNumber = '916300519963' // India country code +91 with phone number 6300519963
  const defaultMessage = "Hi Flash Growth! I'm interested in scaling my business. Could you tell me more about your Growth Packs?"
  const encodedText = encodeURIComponent(defaultMessage)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      pointerEvents: 'auto'
    }}>
      {/* Glossy Tooltip Bubble */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 15, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
              padding: '10px 16px',
              borderRadius: '16px',
              color: '#0A0A0A',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            Chat with our AI Advisor
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pulsing button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          boxShadow: '0 10px 30px rgba(37, 211, 102, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          textDecoration: 'none',
          border: 'none',
          overflow: 'visible'
        }}
      >
        {/* Pulsing Outer Glow Ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid #25D366',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />

        {/* WhatsApp Premium SVG Icon */}
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' }}
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M18.895 5.064a9.742 9.742 0 0 0-14.36 12.39L3 21l3.664-1.189a9.71 9.71 0 0 0 4.717 1.229h.004c5.378 0 9.755-4.377 9.757-9.756a9.702 9.702 0 0 0-2.247-6.22zM11.385 19.34c-1.61 0-3.189-.43-4.57-1.25l-.328-.194-2.613.847.863-2.54-.213-.34a8.077 8.077 0 0 1-1.238-4.298c.002-4.46 3.633-8.09 8.097-8.09 2.162.001 4.195.844 5.723 2.375 1.528 1.53 2.37 3.565 2.368 5.727-.003 4.462-3.634 8.09-8.089 8.09zm4.437-6.059c-.243-.122-1.439-.71-1.662-.792-.224-.082-.387-.122-.55.122-.163.245-.632.793-.775.955-.143.163-.286.184-.53.061-.243-.122-1.028-.38-1.958-1.209-.724-.646-1.213-1.444-1.355-1.688-.143-.245-.015-.377.107-.498.11-.11.243-.286.365-.429.122-.143.163-.245.244-.408.082-.163.041-.306-.02-.429-.061-.122-.55-1.326-.754-1.816-.198-.478-.399-.413-.55-.421-.141-.008-.305-.009-.468-.009a.9.9 0 0 0-.652.306c-.224.245-.856.837-.856 2.041 0 1.204.876 2.367.998 2.53.122.163 1.724 2.632 4.177 3.692.583.252 1.039.403 1.393.516.586.186 1.12.16 1.54.097.469-.071 1.439-.588 1.643-1.156.204-.567.204-1.053.143-1.155-.062-.102-.224-.163-.467-.285z" 
            fill="#ffffff" 
          />
        </svg>
      </motion.a>
    </div>
  )
}
