import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Services } from '../components/Services'
import { Portfolio } from '../components/Portfolio'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'

export function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Control video play state on hover
  useEffect(() => {
    if (videoRef.current) {
      if (hoveredCard === 1) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [hoveredCard])
  const handleCardPress = (index: number) => {
    if (window.innerWidth < 1024) {
      setHoveredCard(hoveredCard === index ? null : index)
    }
  }
  return (
    <div style={{
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      paddingTop: '90px', // Space for Navbar
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: '"DM Sans", system-ui, sans-serif'
    }}>
      {/* Scope specific styles for Bento grid and gloss effects */}
      <style>{`
        .bento-grid {
          display: grid;
          gap: 28px;
          grid-template-columns: 1fr;
          max-width: 1350px;
          margin: 0 auto;
          padding: 24px;
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: auto auto;
          }
          .col-span-7-lg { grid-column: span 7 / span 7; }
          .col-span-5-lg { grid-column: span 5 / span 5; }
          .col-span-4-lg { grid-column: span 4 / span 4; }
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.015);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          position: relative;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px;
          height: 340px; /* Responsive height on mobile */
        }
        @media (min-width: 640px) {
          .glass-card {
            padding: 36px;
            height: 380px; /* Fixed height on desktop */
          }
        }

        .glass-card:hover {
          border-color: rgba(0, 0, 0, 0.9);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
        }

        /* Glossy glare sweep overlay */
        .glare-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.45) 55%, rgba(255,255,255,0) 70%);
          background-size: 200% auto;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .glass-card:hover .glare-overlay {
          opacity: 1;
          animation: shineSweep 1.2s ease-out forwards;
        }

        @keyframes shineSweep {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }

        /* Subtle background mesh grid */
        .bg-mesh {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(0,0,0,0.01) 1px, transparent 1px),
            radial-gradient(circle at 90% 90%, rgba(0,0,0,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Grid pattern background */}
      <div className="bg-mesh" />

      {/* Header section on Landing page */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '0 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '16px'
          }}
        >
          Agency Work
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: '"Sora", sans-serif',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#000000',
            margin: 0
          }}
        >
          Our Core Disciplines
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: '#666666',
            marginTop: '12px',
            maxWidth: '650px',
            marginRight: 'auto',
            marginLeft: 'auto',
            lineHeight: 1.6
          }}
        >
          Explore our creative disciplines. Hover over any bento box to reveal the full-card interactive workspace and animations.
        </motion.p>
      </div>

      {/* Bento Grid Section with Background Video */}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Background Video container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0.05
        }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          >
            <source src="/bento-bg.mp4" type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-wave-lines-42045-large.mp4" type="video/mp4" />
          </video>
          {/* Glassmorphic blur to smooth out video edges and details */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }} />
        </div>

        <div className="bento-grid" style={{ marginBottom: '80px', position: 'relative', zIndex: 1 }}>

        {/* ── Box 1: Video Editing (Wide: 7 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardPress(1)}
          className="glass-card col-span-7-lg"
        >
          <div className="glare-overlay" />
          
          {/* Text Area (Fades out on hover) */}
          <div style={{
            opacity: hoveredCard === 1 ? 0 : 1,
            transform: hoveredCard === 1 ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: hoveredCard === 1 ? 'none' : 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: '24px', fontWeight: 700, color: '#000' }}>
                  Video Editing
                </h3>
                <ArrowUpRight size={20} style={{ color: '#888' }} />
              </div>
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '520px' }}>
                Raw footage transformed into cohesive, high-impact stories. We specialize in cinematic cuts, sound engineering, color grading, and trend-focused pacing for modern platforms.
              </p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em' }}>
              HOVER TO ENTER VIEWPORT
            </div>
          </div>

          {/* Full Card Viewport (reveals on hover, covering the ENTIRE box edge-to-edge) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hoveredCard === 1 ? 1 : 0,
              pointerEvents: hoveredCard === 1 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transform: hoveredCard === 1 ? 'scale(1)' : 'scale(1.02)',
              backgroundColor: '#000000',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Viewfinder Graphic Overlay */}
            <div style={{
              position: 'absolute',
              inset: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              pointerEvents: 'none',
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#ff3b30', fontFamily: 'monospace', letterSpacing: '1px' }}>
                <span>[LR 16:9]</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff3b30' }}
                  />
                  REC
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                <span>1080p 60fps</span>
                <span>CH1 ▂▃▄▅▆▇</span>
              </div>
            </div>

            {/* Loop Video playing inside Viewport */}
            <video
              ref={videoRef}
              src="https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41852-large.mp4"
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />

            {/* Simulated Floating Camera SVG */}
            <motion.div
              animate={{
                scale: hoveredCard === 1 ? 1.08 : 1,
                rotate: hoveredCard === 1 ? [0, -1, 1, 0] : 0
              }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                zIndex: 2,
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
                <circle cx="8" cy="12" r="2" />
              </svg>
            </motion.div>
          </div>
        </motion.div>


        {/* ── Box 2: Photo Editing (Medium: 5 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardPress(2)}
          className="glass-card col-span-5-lg"
        >
          <div className="glare-overlay" />
          
          {/* Text Area (Fades out on hover) */}
          <div style={{
            opacity: hoveredCard === 2 ? 0 : 1,
            transform: hoveredCard === 2 ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: hoveredCard === 2 ? 'none' : 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: '24px', fontWeight: 700, color: '#000' }}>
                  Photo Editing
                </h3>
                <ArrowUpRight size={20} style={{ color: '#888' }} />
              </div>
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14.5px', lineHeight: 1.6 }}>
                Pixel-perfect retouching, high-end color grading, and creative composites. We restore, manipulate, and enhance raw images into commercial-grade visual assets.
              </p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em' }}>
              HOVER TO TRIGGER SHUTTER
            </div>
          </div>

          {/* Full Card Lens & Image (covers the ENTIRE box edge-to-edge) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hoveredCard === 2 ? 1 : 0,
              pointerEvents: hoveredCard === 2 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transform: hoveredCard === 2 ? 'scale(1)' : 'scale(1.02)',
              backgroundColor: '#000000',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Background Edited Photo */}
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop"
              alt="Photo editing mockup"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />

            {/* Aperture SVG Overlay */}
            <motion.div
              animate={{
                rotate: hoveredCard === 2 ? 180 : 0,
                scale: hoveredCard === 2 ? 0.35 : 1.2,
                opacity: hoveredCard === 2 ? 0.15 : 0.8
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                zIndex: 2,
                pointerEvents: 'none'
              }}
            >
              <svg width="220" height="220" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" stroke="#ffffff" strokeWidth="2" />
                <path d="M50 4L34 50L6 32" stroke="#ffffff" strokeWidth="1" />
                <path d="M96 32L50 34L32 6" stroke="#ffffff" strokeWidth="1" />
                <path d="M96 68L50 50L68 6" stroke="#ffffff" strokeWidth="1" />
                <path d="M50 96L66 50L94 68" stroke="#ffffff" strokeWidth="1" />
                <path d="M4 68L50 66L68 94" stroke="#ffffff" strokeWidth="1" />
                <path d="M4 32L50 50L32 94" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </motion.div>

            {/* White Flash overlay triggers once on hover */}
            <AnimatePresence>
              {hoveredCard === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#ffffff',
                    zIndex: 4,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>


        {/* ── Box 3: Content Writing (Small: 4 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardPress(3)}
          className="glass-card col-span-4-lg"
        >
          <div className="glare-overlay" />
          
          {/* Text Area (Fades out on hover) */}
          <div style={{
            opacity: hoveredCard === 3 ? 0 : 1,
            transform: hoveredCard === 3 ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: hoveredCard === 3 ? 'none' : 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: 700, color: '#000' }}>
                  Content Writing
                </h3>
                <ArrowUpRight size={20} style={{ color: '#888' }} />
              </div>
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14px', lineHeight: 1.6 }}>
                Optimized copywriting, technical logs, and brand storytelling. We draft content designed to improve search visibility and connect directly with your target audience.
              </p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em' }}>
              HOVER TO WRITE
            </div>
          </div>

          {/* Full Card Writing Book (covers the ENTIRE box edge-to-edge) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hoveredCard === 3 ? 1 : 0,
              pointerEvents: hoveredCard === 3 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transform: hoveredCard === 3 ? 'scale(1)' : 'scale(1.02)',
              backgroundColor: '#fffefc', // Premium warm book page background
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '80%', height: '80%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Center Binding line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />

              {/* Animated Book pages outline */}
              <motion.svg
                animate={{
                  scale: hoveredCard === 3 ? 1.05 : 1
                }}
                width="140"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.15 }}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </motion.svg>

              {/* Typing lines appearing left to right */}
              <AnimatePresence>
                {hoveredCard === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      top: '25%',
                      left: '12%',
                      right: '12%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.4 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 0.4, delay: 0.2 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 0.4, delay: 0.4 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 0.4, delay: 0.5 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 0.4, delay: 0.7 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                        <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 0.4, delay: 0.9 }} style={{ height: '1.5px', backgroundColor: '#1a1a1a' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated Quill Pen */}
              <motion.div
                animate={hoveredCard === 3 ? {
                  x: [-20, 25, -15, 30, -5],
                  y: [-15, 10, -25, 0, -10],
                  rotate: [15, 25, 10, 20, 15]
                } : {
                  x: 40,
                  y: -30,
                  rotate: 45
                }}
                transition={{
                  repeat: hoveredCard === 3 ? Infinity : 0,
                  duration: 2,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  right: '20%',
                  top: '20%',
                  zIndex: 3
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>


        {/* ── Box 4: Prompt Engineering (Small: 4 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardPress(4)}
          className="glass-card col-span-4-lg"
        >
          <div className="glare-overlay" />
          
          {/* Text Area (Fades out on hover) */}
          <div style={{
            opacity: hoveredCard === 4 ? 0 : 1,
            transform: hoveredCard === 4 ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: hoveredCard === 4 ? 'none' : 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: 700, color: '#000' }}>
                  AI Automations
                </h3>
                <ArrowUpRight size={20} style={{ color: '#888' }} />
              </div>
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14px', lineHeight: 1.6 }}>
                Building advanced prompts for large language models. We construct operational automations, multi-agent frameworks, and contextual prompts to optimize business tasks.
              </p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em' }}>
              HOVER TO RUN PROMPTS
            </div>
          </div>

          {/* Full Card Console (covers the ENTIRE box edge-to-edge) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hoveredCard === 4 ? 1 : 0,
              pointerEvents: hoveredCard === 4 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transform: hoveredCard === 4 ? 'scale(1)' : 'scale(1.02)',
              backgroundColor: '#0c0c0e', // Sleek terminal background
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              fontFamily: 'monospace',
              overflow: 'hidden'
            }}
          >
            {/* Terminal Titlebar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>bash - prompt-optimizer</span>
            </div>

            {/* Terminal Code Outputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#a9b1d6', textAlign: 'left', lineHeight: '1.4' }}>
              <span style={{ color: '#0066FF' }}>$ npx flash-prompt-evaluator --system</span>
              <AnimatePresence>
                {hoveredCard === 4 && (
                  <>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>&gt; Load System Instructions... [OK]</motion.span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ color: '#e0af68' }}>&gt; Injecting Context: Lakeland datasets</motion.span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ color: '#73daca' }}>&gt; Compiling chain-of-thought structure...</motion.span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ color: '#9ece6a' }}>&gt; Agent initialized. Ready to execute.</motion.span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#ff007f' }}>$ await agent.run()_</span>
                      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '4px', height: '11px', backgroundColor: '#fff', marginLeft: '2px' }} />
                    </motion.span>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>


        {/* ── Box 5: Marketing & Business Growth (Small: 4 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onMouseEnter={() => setHoveredCard(5)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardPress(5)}
          className="glass-card col-span-4-lg"
        >
          <div className="glare-overlay" />
          
          {/* Text Area (Fades out on hover) */}
          <div style={{
            opacity: hoveredCard === 5 ? 0 : 1,
            transform: hoveredCard === 5 ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            pointerEvents: hoveredCard === 5 ? 'none' : 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: 700, color: '#000' }}>
                  Growth Strategies
                </h3>
                <ArrowUpRight size={20} style={{ color: '#888' }} />
              </div>
              <p style={{ color: '#555', marginTop: '16px', fontSize: '14px', lineHeight: 1.6 }}>
                Strategic channel acquisition, brand campaigns, and marketing automation. We create growth funnels that scale pipelines and accelerate market presence.
              </p>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.05em' }}>
              HOVER TO MEET CLIENTS
            </div>
          </div>

          {/* Full Card Meeting space (covers the ENTIRE box edge-to-edge) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hoveredCard === 5 ? 1 : 0,
              pointerEvents: hoveredCard === 5 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              transform: hoveredCard === 5 ? 'scale(1)' : 'scale(1.02)',
              backgroundColor: '#fafbfc',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '85%', height: '85%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
              {/* Meeting avatars */}
              <motion.div
                animate={hoveredCard === 5 ? {
                  x: [0, 15, 8],
                  scale: 1.08
                } : { x: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>FG</div>
                <div style={{ width: '56px', height: '18px', backgroundColor: '#000', borderRadius: '8px 8px 0 0', marginTop: '6px' }} />
              </motion.div>

              <motion.div
                animate={hoveredCard === 5 ? {
                  x: [0, -15, -8],
                  scale: 1.08
                } : { x: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>👤</div>
                <div style={{ width: '56px', height: '18px', backgroundColor: '#0066FF', borderRadius: '8px 8px 0 0', marginTop: '6px' }} />
              </motion.div>

              {/* Handshake line connector */}
              <AnimatePresence>
                {hoveredCard === 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: -20 }}
                    style={{
                      position: 'absolute',
                      fontSize: '32px',
                      zIndex: 3,
                      top: '22%'
                    }}
                  >
                    🤝
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background growth path */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, opacity: hoveredCard === 5 ? 0.35 : 0.05, transition: 'opacity 0.4s' }}>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={hoveredCard === 5 ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  d="M10 85 Q 35 70, 55 45 T 90 20"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.5"
                />
                {hoveredCard === 5 && (
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                    cx="90"
                    cy="20"
                    r="4"
                    fill="#0066FF"
                  />
                )}
              </svg>
            </div>
          </div>
        </motion.div>

      </div>
    </div>

      {/* ── Additional Core Sections (Services, Projects, Contact, Footer) ── */}
      <div id="services">
        <Services />
      </div>

      <div id="work">
        <Portfolio />
      </div>

      <div id="contact">
        <Contact />
      </div>

      <Footer />
    </div>
  )
}
