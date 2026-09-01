import { useMemo, useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useRequirements } from '../hooks/useRequirements'
import { useClients } from '../hooks/useClients'
import { useDocuments } from '../hooks/useDocuments'

export default function Documents() {
  const { clients } = useClients()
  const { projects } = useProjects()
  const { requirements } = useRequirements()
  const { documents, addDocument, deleteDocument, getDocumentBlob } = useDocuments()

  // Add form
  const [projectId, setProjectId] = useState('')
  const [requirementId, setRequirementId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  // View filter
  const [viewProjectId, setViewProjectId] = useState('') // empty = all

  const clientNameById = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients])

  const projectLabelById = useMemo(() => {
    const map = new Map<string, string>()
    projects.forEach((p) => {
      const clientName = clientNameById.get(p.clientId) ?? 'Unknown Client'
      map.set(p.id, `${clientName} — ${p.name}`)
    })
    return map
  }, [projects, clientNameById])

  const requirementsForProject = useMemo(() => {
    if (!projectId) return []
    return requirements.filter((r) => r.projectId === projectId)
  }, [requirements, projectId])

  const viewDocuments = useMemo(() => {
    if (!viewProjectId) return documents
    return documents.filter((d) => d.projectId === viewProjectId)
  }, [documents, viewProjectId])

  const groupedByProject = useMemo(() => {
    const map = new Map<string, typeof documents>()
    for (const d of viewDocuments) {
      const key = d.projectId || 'unknown'
      const arr = map.get(key) ?? []
      arr.push(d)
      map.set(key, arr)
    }
    return map
  }, [viewDocuments, documents])

  const handleAdd = async () => {
    if (!projectId) return alert('Select a project')
    if (!title.trim()) return alert('Enter document title')
    if (!file) return alert('Select a PDF file')
    if (file.type !== 'application/pdf') return alert('Only PDF is allowed for now.')

    setBusy(true)
    try {
      await addDocument({
        projectId,
        requirementId: requirementId || undefined,
        title: title.trim(),
        file,
      })
      setTitle('')
      setFile(null)
      setRequirementId('')
    } finally {
      setBusy(false)
    }
  }

  const openDoc = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    if (!doc) return
    const blob = await getDocumentBlob(doc)
    if (!blob) return alert('File not found in storage.')

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const downloadDoc = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    if (!doc) return
    const blob = await getDocumentBlob(doc)
    if (!blob) return alert('File not found in storage.')

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName || 'document.pdf'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="muted">Upload PDFs and view them project-wise.</p>
        </div>
      </div>

      <section className="card">
        <h2 className="card-title">Add PDF</h2>

        <div className="form-grid">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value)
              setRequirementId('')
            }}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {projectLabelById.get(p.id) ?? p.name}
              </option>
            ))}
          </select>

          <select value={requirementId} onChange={(e) => setRequirementId(e.target.value)} disabled={!projectId}>
            <option value="">(Optional) Link to Requirement</option>
            {requirementsForProject.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Document Title (e.g. SRS v1, Proposal, Notes)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleAdd} disabled={busy}>
            {busy ? 'Uploading...' : 'Add PDF'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">View Documents</h2>

        <div className="form-grid">
          <select value={viewProjectId} onChange={(e) => setViewProjectId(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {projectLabelById.get(p.id) ?? p.name}
              </option>
            ))}
          </select>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          Showing <strong>{viewDocuments.length}</strong> documents.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">Documents (Project-wise)</h2>

        {viewDocuments.length === 0 ? (
          <p className="muted">No documents uploaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {Array.from(groupedByProject.entries()).map(([pid, docs]) => (
              <div key={pid}>
                <div className="doc-group-title">
                  {projectLabelById.get(pid) ?? 'Unknown / Deleted Project'}{' '}
                  <span className="muted">({docs.length})</span>
                </div>

                <div className="client-list">
                  {docs.map((d) => (
                    <div className="client-card" key={d.id}>
                      <div className="client-info">
                        <h3>{d.title}</h3>
                        <p>
                          <strong>File:</strong> {d.fileName} ({Math.round(d.size / 1024)} KB)
                        </p>
                        <p>
                          <strong>Added:</strong> {new Date(d.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="client-actions">
                        <button className="btn btn-primary" type="button" onClick={() => openDoc(d.id)}>
                          Open
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={() => downloadDoc(d.id)}>
                          Download
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={async () => {
                            const ok = confirm('Delete this document?')
                            if (!ok) return
                            await deleteDocument(d.id)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}