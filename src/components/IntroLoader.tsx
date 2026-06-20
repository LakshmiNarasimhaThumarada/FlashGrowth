import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

interface IntroLoaderProps {
  onComplete: () => void
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const text = "FLASH GROWTH"
  
  // The entire animation completes and transitions out in exactly 2.5 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f7f9fd 60%, #edf1f8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      <style>{`
        .intro-glass-panel {
          padding: 36px 20px;
          width: 92%;
          max-width: 720px;
        }
        @media (min-width: 640px) {
          .intro-glass-panel {
            padding: 54px 74px;
            width: auto;
          }
        }
      `}</style>
      {/* ── Ambient Glowing Background Spheres ── */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '12%',
          left: '22%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(235, 242, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(70px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -20, 20, 0],
          y: [0, 30, -30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: '12%',
          right: '18%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242, 245, 255, 0.75) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Central Premium Glass Panel ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="intro-glass-panel"
        style={{
          position: 'relative',
          zIndex: 10,
          borderRadius: '26px',
          background: 'rgba(255, 255, 255, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 25px 55px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Reflection overlay highlight */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 100%)',
          borderRadius: '26px 26px 0 0',
          pointerEvents: 'none',
        }} />

        {/* ── Letter-by-Letter Inside-Fills ── */}
        <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: '0.05em', userSelect: 'none' }}>
          {text.split('').map((char, index) => {
            if (char === ' ') {
              // Space spacer
              return <span key={index} style={{ width: '0.45em' }} />
            }
            return (
              <span
                key={index}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  fontSize: 'clamp(20px, 6.5vw, 76px)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  fontFamily: '"Sora", "Inter", sans-serif',
                  lineHeight: 1.15,
                }}
              >
                {/* Layer 1: Transparent Outline Letter (Immediately visible) */}
                <span
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '1.2px rgba(0, 0, 0, 0.16)',
                    display: 'block',
                  }}
                >
                  {char}
                </span>

                {/* Layer 2: Black Color Fill loading inside each letter bottom-to-top */}
                <motion.span
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{
                    duration: 1.4,
                    ease: [0.25, 1, 0.5, 1],
                    delay: 0.05 + index * 0.05, // Staggered loading inside each letter
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    display: 'block',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      color: '#000000',
                      // Metallic glossy black gradient
                      background: 'linear-gradient(180deg, #333333 0%, #000000 45%, #151515 70%, #444444 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {char}
                  </span>
                </motion.span>

                {/* Layer 3: Subtle Glossy shine sweep inside each letter */}
                <motion.span
                  initial={{ height: '0%' }}
                  animate={{ height: '100%' }}
                  transition={{
                    duration: 1.4,
                    ease: [0.25, 1, 0.5, 1],
                    delay: 0.05 + index * 0.05,
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    display: 'block',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                >
                  <motion.span
                    animate={{
                      backgroundPosition: ['150% 0%', '-150% 0%'],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0) 65%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {char}
                  </motion.span>
                </motion.span>
              </span>
            )
          })}
        </div>

        {/* ── Elegant Minimal Tagline ── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.45, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            color: '#000000',
            fontSize: '11px',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            marginTop: '28px',
            marginBottom: 0,
            fontFamily: '"Sora", "Inter", sans-serif',
            fontWeight: 500,
            userSelect: 'none',
          }}
        >
          Marketing &amp; Growth Agency
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
