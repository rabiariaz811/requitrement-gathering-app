import { Link, useParams } from 'react-router-dom'
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useRequirements } from '../hooks/useRequirements'
import { exportRequirementsPdf } from '../lib/exportRequirementsPdf'
import type { Requirement } from '../types'

export default function ProjectDetails() {
  const { id } = useParams()
  const { clients } = useClients()
  const { getProjectById } = useProjects()
  const { requirements } = useRequirements()

  const project = id ? getProjectById(id) : null
  const client = project ? clients.find((c) => c.id === project.clientId) : null

  if (!project) {
    return (
      <div className="container">
        <div className="card">
          <h2 style={{ margin: 0 }}>Project not found</h2>
          <p className="muted">This project may have been deleted.</p>
          <Link className="btn btn-secondary" to="/projects">Back to Projects</Link>
        </div>
      </div>
    )
  }

  const projectRequirements = requirements.filter((r) => r.projectId === project.id)

  const getProjectLabel = () => project.name

  const exportProjectPdf = () => {
    if (projectRequirements.length === 0) return alert('No requirements to export for this project.')
    exportRequirementsPdf({
      requirements: projectRequirements,
      reportTitle: `Requirements Report - ${project.name}`,
      clientLabel: client?.name,
      projectLabel: project.name,
      getProjectLabel,
    })
  }

  const exportOne = (r: Requirement) => {
    exportRequirementsPdf({
      requirements: [r],
      reportTitle: `Requirement - ${r.title}`,
      clientLabel: client?.name,
      projectLabel: project.name,
      getProjectLabel,
    })
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>{project.name}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              <strong>Client:</strong> {client ? `${client.name} (${client.company})` : '—'} &nbsp; | &nbsp;
              <strong>Status:</strong> {project.status}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={exportProjectPdf}>
              Export Requirements PDF
            </button>
            <Link className="btn btn-secondary" to={`/requirements?projectId=${project.id}`}>
              Add / View in Requirements
            </Link>
          </div>
        </div>

        {project.description ? (
          <p className="muted" style={{ marginTop: 10 }}>
            <strong>Notes:</strong> {project.description}
          </p>
        ) : null}
      </div>

      <div className="card">
        <h3 style={{ margin: 0 }}>Requirements ({projectRequirements.length})</h3>

        {projectRequirements.length === 0 ? (
          <p className="muted" style={{ marginTop: 10 }}>
            No requirements yet for this project.
          </p>
        ) : (
          <div className="client-list" style={{ marginTop: 12 }}>
            {projectRequirements.map((r) => (
              <div className="client-card" key={r.id}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontWeight: 1000, fontSize: 16 }}>{r.title}</div>

                    <button className="btn btn-secondary" type="button" onClick={() => exportOne(r)}>
                      Export PDF
                    </button>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span className={`badge badge-priority priority-${r.priority.toLowerCase()}`}>{r.priority}</span>{' '}
                    <span className="badge">{r.status}</span>
                  </div>

                  {r.description ? <div className="muted" style={{ marginTop: 8 }}>{r.description}</div> : null}

                  {r.attachments?.length ? (
                    <div className="attachments">
                      {r.attachments.map((a) => (
                        <a key={a.id} href={a.dataUrl} target="_blank" rel="noreferrer">
                          <img className="thumb" src={a.dataUrl} alt={a.name} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="client-actions">
                  <Link className="btn btn-secondary" to="/requirements">
                    Open Requirements
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}