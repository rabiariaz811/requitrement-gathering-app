import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useRequirements } from '../hooks/useRequirements'
import type { Project, ProjectInput, ProjectStatus } from '../types'

const statuses: ProjectStatus[] = ['Planned', 'In Progress', 'On Hold', 'Done']

const emptyForm: ProjectInput = {
  clientId: '',
  name: '',
  description: '',
  status: 'In Progress',
}

export default function Projects() {
  const { clients } = useClients()
  const { projects, addProject, updateProject, deleteProject } = useProjects()
  const { requirements } = useRequirements()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [q, setQ] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectInput>(emptyForm)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])

  const requirementsCountByProject = useMemo(() => {
    const map = new Map<string, { reqs: number; attachments: number }>()
    for (const r of requirements) {
      const cur = map.get(r.projectId) ?? { reqs: 0, attachments: 0 }
      cur.reqs += 1
      cur.attachments += (r.attachments?.length ?? 0)
      map.set(r.projectId, cur)
    }
    return map
  }, [requirements])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const isArchived = (p: Project) => p.status === 'Done'
    const byTab = projects.filter((p) => (tab === 'archived' ? isArchived(p) : !isArchived(p)))

    if (!query) return byTab

    return byTab.filter((p) => {
      const client = clientById.get(p.clientId)
      const hay = `${p.name} ${p.description ?? ''} ${client?.name ?? ''} ${client?.company ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [projects, tab, q, clientById])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: Project) => {
    setEditingId(p.id)
    setForm({ clientId: p.clientId, name: p.name, description: p.description, status: p.status })
    setModalOpen(true)
  }

  const setField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = () => {
    const clientId = form.clientId.trim()
    const name = form.name.trim()
    const description = form.description.trim()

    if (!clientId) return alert('Please select a client')
    if (!name) return alert('Project title is required')

    const payload: ProjectInput = { clientId, name, description, status: form.status }

    if (editingId) updateProject(editingId, payload)
    else addProject(payload)

    setModalOpen(false)
  }

  const remove = (id: string) => {
    const ok = confirm('Delete this project?')
    if (!ok) return
    deleteProject(id)
  }

  return (
    <div className="container">
      <div className="toolbar">
        <div className="search">
          <span className="search-icon">🔎</span>
          <input
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, clients, requirements..."
          />
        </div>

        <button className="btn btn-primary" type="button" onClick={openCreate} disabled={clients.length === 0}>
          + New Project
        </button>
      </div>

      <div className="segmented">
        <button className={`seg-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')} type="button">
          Active Projects
        </button>
        <button className={`seg-btn ${tab === 'archived' ? 'active' : ''}`} onClick={() => setTab('archived')} type="button">
          Archived
        </button>
      </div>

      <div className="section-meta">
        <div className="meta-title">{filtered.length} {tab === 'active' ? 'ACTIVE' : 'ARCHIVED'} PROJECT(S)</div>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <h3 style={{ margin: 0 }}>No clients yet</h3>
          <p className="muted">Add a client first to create projects.</p>
          <Link className="btn btn-secondary" to="/clients">Go to Clients</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <h3 style={{ margin: 0 }}>No {tab === 'active' ? 'active' : 'archived'} projects yet</h3>
          <p className="muted">Create your first project to get started.</p>
          <button className="btn btn-primary" type="button" onClick={openCreate}>+ New Project</button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((p) => {
            const client = clientById.get(p.clientId)
            const counts = requirementsCountByProject.get(p.id) ?? { reqs: 0, attachments: 0 }

            return (
              <div
                className="project-card"
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/projects/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/projects/${p.id}`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="project-top">
                  <span className={`pill pill-${p.status.replace(/\s/g, '').toLowerCase()}`}>{p.status}</span>

                  <button
                    className="icon-btn"
                    type="button"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(p)
                    }}
                  >
                    ⋮
                  </button>
                </div>

                <div className="project-title">{p.name}</div>
                <div className="project-sub">{client ? client.company : '—'}</div>
                {p.description ? <div className="project-desc">{p.description}</div> : null}

                <div className="project-meta">
                  <span>📄 {counts.reqs} requirements</span>
                  <span>📎 {counts.attachments} attachments</span>
                </div>

                <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                  <Link className="btn btn-secondary" to={`/projects/${p.id}`}>View</Link>
                  <button className="btn btn-edit" type="button" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger" type="button" onClick={() => remove(p.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Project' : 'Start New Project'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={submit}>
              {editingId ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        }
      >
        <div className="modal-form">
          <label className="label">CLIENT NAME *</label>
          <select value={form.clientId} onChange={(e) => setField('clientId', e.target.value)}>
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company})
              </option>
            ))}
          </select>

          <label className="label">PROJECT / VISIT TITLE *</label>
          <input value={form.name} onChange={(e) => setField('name', e.target.value)} />

          <label className="label">STATUS</label>
          <select value={form.status} onChange={(e) => setField('status', e.target.value as ProjectStatus)}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="label">NOTES (optional)</label>
          <input value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}