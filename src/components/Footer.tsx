import { Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <a href="/" className="footer-logo">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="14" fill="#0A0A0A" />
                <path
                  d="M38 12L20 36h12l-6 16 18-24H32l6-16z"
                  fill="#0066FF"
                  stroke="#0066FF"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="footer-logo-text">Flash Growth</span>
            </a>
            <p className="footer-tagline">
              We accelerate brands with strategic marketing, data-driven campaigns, and bold creative that delivers measurable returns.
            </p>
            <div className="footer-social-row">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li><a href="#hero">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#work">Our Work</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links-list">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="footer-bottom-row">
          <p className="copyright-text">
            &copy; {currentYear} Flash Growth. All rights reserved.
          </p>
          <p className="credits-text">
            Designed for performance & growth.
          </p>
        </div>
      </div>
    </footer>
  )
}
