import { motion } from 'framer-motion'
import { Services } from '../components/Services'
import { Portfolio } from '../components/Portfolio'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'

export function LandingPage() {
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

      {/* 1. Immersive Hero Section (Beneath Navbar) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 90px)', // Perfectly fills viewport beneath the fixed navbar
        backgroundColor: '#030305',
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 102, 255, 0.15) 0%, rgba(3, 3, 5, 1) 75%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 50px 50px, 50px 50px',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Floating title overlay */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
          maxWidth: '900px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0066FF',
              color: '#ffffff',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            Digital Growth Agency
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: '"Sora", sans-serif',
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.15,
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}
          >
            Grow Fast.<br />Grow Bold.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '20px',
              lineHeight: 1.6,
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            We build high-performance digital products, creative media, and automated growth systems. Scale your brand with modern digital engineering.
          </motion.p>
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
