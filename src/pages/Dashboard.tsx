import { Link } from 'react-router-dom'
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useRequirements } from '../hooks/useRequirements'
import { useDocuments } from '../hooks/useDocuments'

export default function Dashboard() {
  const { clients } = useClients()
  const { projects } = useProjects()
  const { requirements } = useRequirements()
  const { documents } = useDocuments()

  return (
    <div className="container">
      <div className="dash-hero">
        <div>
          <div className="dash-title">Dashboard</div>
          <div className="dash-subtitle">Quick overview of clients, projects, requirements and documents.</div>
        </div>
      </div>

      <div className="dash-grid">
        <Link className="dash-card" to="/clients">
          <div className="dash-card-top">
            <div className="dash-icon">👤</div>
            <div className="dash-label">Clients</div>
          </div>
          <div className="dash-number">{clients.length}</div>
          <div className="dash-hint">Manage clients</div>
        </Link>

        <Link className="dash-card" to="/projects">
          <div className="dash-card-top">
            <div className="dash-icon">📁</div>
            <div className="dash-label">Projects</div>
          </div>
          <div className="dash-number">{projects.length}</div>
          <div className="dash-hint">Active & archived</div>
        </Link>

        <Link className="dash-card" to="/requirements">
          <div className="dash-card-top">
            <div className="dash-icon">✅</div>
            <div className="dash-label">Requirements</div>
          </div>
          <div className="dash-number">{requirements.length}</div>
          <div className="dash-hint">Search & export PDF</div>
        </Link>

        <Link className="dash-card" to="/documents">
          <div className="dash-card-top">
            <div className="dash-icon">📄</div>
            <div className="dash-label">Documents</div>
          </div>
          <div className="dash-number">{documents.length}</div>
          <div className="dash-hint">PDFs per project</div>
        </Link>
      </div>

      <div className="card">
        <h3 style={{ margin: 0 }}>Tips</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          Use Projects to create work items, then add Requirements with priority and export them to PDF.
        </p>
      </div>
    </div>
  )
}