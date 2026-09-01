import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Clients from './pages/clients'
import Requirements from './pages/Requirements'
import Documents from './pages/Documents'
import ProjectDetails from './pages/ProjectDetails'

import './App.css'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function Shell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const showBack = location.pathname !== '/'

  useEffect(() => setDrawerOpen(false), [location.pathname])

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const doInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <div className="header-actions">
            <button className="icon-btn header-menu" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              ☰
            </button>

            {showBack && (
              <button className="icon-btn" type="button" onClick={goBack} aria-label="Go back" title="Back">
                ←
              </button>
            )}
          </div>

          <div className="brand">
            <div className="brand-name">Requirement Gathering</div>
          </div>
        </div>

        <div className="header-right">
          <button className="btn btn-soft" type="button" onClick={doInstall} disabled={!installPrompt}>
            Install
          </button>
          <span className={`status-pill ${online ? 'ok' : 'bad'}`}>{online ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      <div className={`drawer-backdrop ${drawerOpen ? 'show' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <div className="drawer-title">Menu</div>
          <button className="icon-btn" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/clients">Clients</Link>
          <Link to="/requirements">Requirements</Link>
          <Link to="/documents">Documents</Link>
        </nav>
      </aside>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}