import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { UserDashboard } from './pages/UserDashboard'
import { AuthProvider } from './context/AuthContext'
import { IntroLoader } from './components/IntroLoader'
import { AnimatePresence } from 'framer-motion'

// Admin Views
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminMembers } from './pages/admin/AdminMembers'
import { AdminServices } from './pages/admin/AdminServices'
import { AdminClients } from './pages/admin/AdminClients'
import { AdminPortfolio } from './pages/admin/AdminPortfolio'
import { AdminSettings } from './pages/admin/AdminSettings'

function AppContent() {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminPath && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  const [showLoader, setShowLoader] = useState(() => {
    // Show loader once per session to maintain good UX
    return !sessionStorage.getItem('flash_intro_seen')
  })

  const handleLoaderComplete = () => {
    sessionStorage.setItem('flash_intro_seen', 'true')
    setShowLoader(false)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {showLoader ? (
            <IntroLoader key="loader" onComplete={handleLoaderComplete} />
          ) : (
            <AppContent key="content" />
          )}
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
export { AppContent }
