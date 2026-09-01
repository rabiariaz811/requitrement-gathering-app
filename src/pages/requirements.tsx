import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useClients } from '../hooks/useClients'
import { useProjects } from '../hooks/useProjects'
import { useRequirements } from '../hooks/useRequirements'
import { exportRequirementsPdf } from '../lib/exportRequirementsPdf'
import type {
  Project,
  Requirement,
  RequirementAttachment,
  RequirementInput,
  RequirementPriority,
  RequirementStatus,
} from '../types'

const emptyForm: RequirementInput = {
  projectId: '',
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Draft',
  attachments: [],
}

const priorities: RequirementPriority[] = ['Low', 'Medium', 'High', 'Critical']
const statuses: RequirementStatus[] = ['Draft', 'Approved', 'In Development', 'Done']

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Requirements() {
  const { clients } = useClients()
  const { projects } = useProjects()
  const { requirements, addRequirement, updateRequirement, deleteRequirement } = useRequirements()

  const [searchParams] = useSearchParams()
  const projectIdFromUrl = searchParams.get('projectId') ?? ''

  const [form, setForm] = useState<RequirementInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isEditing = editingId !== null

  const [q, setQ] = useState('')
  const [filterClientId, setFilterClientId] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterPriority, setFilterPriority] = useState<RequirementPriority | ''>('')
  const [filterStatus, setFilterStatus] = useState<RequirementStatus | ''>('')

  // If opened from ProjectDetails, auto select that project
  useEffect(() => {
    if (projectIdFromUrl) {
      setFilterProjectId(projectIdFromUrl)
      setForm((p) => ({ ...p, projectId: projectIdFromUrl }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdFromUrl])

  const updateField = <K extends keyof RequirementInput>(key: K, value: RequirementInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const clearFilters = () => {
    setQ('')
    setFilterClientId('')
    setFilterProjectId(projectIdFromUrl || '') // keep project lock if coming from project
    setFilterPriority('')
    setFilterStatus('')
  }

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const projectLabelById = useMemo(() => {
    const clientNameById = new Map(clients.map((c) => [c.id, c.name]))
    const map = new Map<string, string>()
    projects.forEach((p) => {
      const clientName = clientNameById.get(p.clientId) ?? 'Unknown Client'
      map.set(p.id, `${clientName} — ${p.name}`)
    })
    return map
  }, [clients, projects])

  const getProjectLabel = (projectId: string) => projectLabelById.get(projectId) ?? '—'

  const projectsForFilter = useMemo(() => {
    if (!filterClientId) return projects
    return projects.filter((p) => p.clientId === filterClientId)
  }, [projects, filterClientId])

  const filteredRequirements = useMemo(() => {
    const query = q.trim().toLowerCase()

    return requirements.filter((r) => {
      const proj = projectsById.get(r.projectId)

      if (filterClientId) {
        if (!proj) return false
        if (proj.clientId !== filterClientId) return false
      }
      if (filterProjectId && r.projectId !== filterProjectId) return false
      if (filterPriority && r.priority !== filterPriority) return false
      if (filterStatus && r.status !== filterStatus) return false

      if (query) {
        const hay = (r.title + ' ' + (r.description ?? '')).toLowerCase()
        if (!hay.includes(query)) return false
      }

      return true
    })
  }, [requirements, projectsById, q, filterClientId, filterProjectId, filterPriority, filterStatus])

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const MAX_FILES_TOTAL = 5
    const MAX_FILE_SIZE = 800 * 1024

    const remaining = Math.max(0, MAX_FILES_TOTAL - form.attachments.length)
    const picked = Array.from(files).slice(0, remaining)

    const newAttachments: RequirementAttachment[] = []

    for (const file of picked) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_FILE_SIZE) continue
      const dataUrl = await toDataUrl(file)
      newAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        createdAt: new Date().toISOString(),
      })
    }

    if (newAttachments.length) {
      setForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }))
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== attachmentId) }))
  }

  const handleSubmit = () => {
    const projectId = form.projectId.trim()
    const title = form.title.trim()
    const description = form.description.trim()

    if (!projectId) return alert('Please select a project')
    if (!title) return alert('Title is required')

    const input: RequirementInput = {
      projectId,
      title,
      description,
      priority: form.priority,
      status: form.status,
      attachments: form.attachments,
    }

    if (isEditing) updateRequirement(editingId, input)
    else addRequirement(input)

    resetForm()
  }

  const startEdit = (req: Requirement) => {
    setEditingId(req.id)
    setForm({
      projectId: req.projectId,
      title: req.title,
      description: req.description,
      priority: req.priority,
      status: req.status,
      attachments: req.attachments ?? [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    const ok = confirm('Delete this requirement?')
    if (!ok) return
    deleteRequirement(id)
    if (editingId === id) resetForm()
  }

  const exportListPdf = () => {
    if (filteredRequirements.length === 0) return alert('No requirements to export.')

    const clientLabel = filterClientId
      ? clients.find((c) => c.id === filterClientId)?.name ?? ''
      : undefined

    const projectLabel = filterProjectId ? getProjectLabel(filterProjectId) : undefined

    exportRequirementsPdf({
      requirements: filteredRequirements,
      reportTitle: 'Requirements Report',
      clientLabel,
      projectLabel,
      getProjectLabel,
    })
  }

  const exportOne = (r: Requirement) => {
    exportRequirementsPdf({
      requirements: [r],
      reportTitle: `Requirement - ${r.title}`,
      projectLabel: getProjectLabel(r.projectId),
      getProjectLabel,
    })
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Add Requirement</h2>

        {projects.length === 0 ? (
          <p className="muted">
            Add a project first in <Link to="/projects">Projects</Link>.
          </p>
        ) : (
          <>
            <div className="form-grid-4">
              <div className="field">
                <div className="field-label">Project *</div>
                <select value={form.projectId} onChange={(e) => updateField('projectId', e.target.value)}>
                  <option value="">Select Project</option>
                  {projects.map((p: Project) => (
                    <option key={p.id} value={p.id}>
                      {getProjectLabel(p.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="field-label">Title *</div>
                <input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
              </div>

              <div className="field">
                <div className="field-label">Priority</div>
                <select value={form.priority} onChange={(e) => updateField('priority', e.target.value as RequirementPriority)}>
                  {priorities.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div className="field">
                <div className="field-label">Status</div>
                <select value={form.status} onChange={(e) => updateField('status', e.target.value as RequirementStatus)}>
                  {statuses.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="field-label">Description</div>
                <input value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="field-label">Attachments (optional)</div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={async (e) => {
                  await handleAddPhotos(e.target.files)
                  e.currentTarget.value = ''
                }}
              />

              {form.attachments.length > 0 && (
                <div className="attachments">
                  {form.attachments.map((a) => (
                    <div className="attachment-item" key={a.id}>
                      <a href={a.dataUrl} target="_blank" rel="noreferrer">
                        <img className="thumb" src={a.dataUrl} alt={a.name} />
                      </a>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => removeAttachment(a.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="button" onClick={handleSubmit}>
                {isEditing ? 'Update Requirement' : 'Add Requirement'}
              </button>
              {isEditing && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="filters-header">
          <h2 className="card-title">Search & Filters</h2>
          <div className="filters-meta">
            <span className="muted">
              Showing <strong>{filteredRequirements.length}</strong> of <strong>{requirements.length}</strong>
            </span>
            <button className="btn btn-secondary" type="button" onClick={clearFilters}>Clear</button>
            <button className="btn btn-primary" type="button" onClick={exportListPdf}>Export List PDF</button>
          </div>
        </div>

        <div className="filters-grid">
          <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />

          <select
            value={filterClientId}
            onChange={(e) => {
              setFilterClientId(e.target.value)
              if (!projectIdFromUrl) setFilterProjectId('')
            }}
            disabled={!!projectIdFromUrl}
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company})
              </option>
            ))}
          </select>

          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            disabled={!!projectIdFromUrl}
          >
            <option value="">All Projects</option>
            {projectsForFilter.map((p) => (
              <option key={p.id} value={p.id}>
                {getProjectLabel(p.id)}
              </option>
            ))}
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)}>
            <option value="">All Priorities</option>
            {priorities.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="">All Status</option>
            {statuses.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Requirements</h2>

        {filteredRequirements.length === 0 ? (
          <p className="muted">No requirements found.</p>
        ) : (
          <div className="client-list">
            {filteredRequirements.map((r) => (
              <div className="client-card" key={r.id}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div style={{ fontWeight: 1000, fontSize: 16 }}>{r.title}</div>

                    <button className="btn btn-secondary" type="button" onClick={() => exportOne(r)}>
                      Export PDF
                    </button>
                  </div>

                  <div className="muted" style={{ marginTop: 6 }}>
                    <strong>Project:</strong> {getProjectLabel(r.projectId)}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span className={`badge badge-priority priority-${r.priority.toLowerCase()}`}>{r.priority}</span>{' '}
                    <span className="badge">{r.status}</span>
                  </div>

                  {r.description ? <div className="muted" style={{ marginTop: 8 }}>{r.description}</div> : null}
                </div>

                <div className="client-actions">
                  <button className="btn btn-edit" type="button" onClick={() => startEdit(r)}>Edit</button>
                  <button className="btn btn-danger" type="button" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}