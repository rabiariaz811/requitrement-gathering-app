import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Clients from './pages/clients'
import Requirements from './pages/Requirements'
import Documents from './pages/Documents'
import ProjectDetails from './pages/ProjectDetails'


function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>Requirement App</h2>

          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/requirements">Requirements</Link>
            <Link to="/documents">Documents</Link>
          </nav>
        </aside>

        <main className="main-content">
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
    </BrowserRouter>
  )
}

export default App