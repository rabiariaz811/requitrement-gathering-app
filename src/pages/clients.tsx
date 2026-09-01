import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import type { Client, ClientInput } from '../types'

const emptyForm: ClientInput = { name: '', email: '', phone: '', company: '' }

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients()

  const [form, setForm] = useState<ClientInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isEditing = editingId !== null

  const updateField = (key: keyof ClientInput, value: string) => {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = () => {
    const name = form.name.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const company = form.company.trim()

    if (!name || !email || !phone || !company) return alert('Please fill in all fields')
    if (!isValidEmail(email)) return alert('Please enter a valid email')

    const input: ClientInput = { name, email, phone, company }

    if (isEditing) updateClient(editingId, input)
    else addClient(input)

    resetForm()
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    const ok = confirm('Delete this client?')
    if (!ok) return
    deleteClient(id)
    if (editingId === id) resetForm()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="muted">Create and manage your clients.</p>
        </div>
      </div>

      <section className="card">
        <h2 className="card-title">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>

        <div className="form-grid-4">
          <div className="field">
            <div className="field-label">Client Name</div>
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label">Email</div>
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label">Phone</div>
            <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label">Company</div>
            <input value={form.company} onChange={(e) => updateField('company', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="button" onClick={handleSubmit}>
            {isEditing ? 'Update Client' : 'Add Client'}
          </button>

          {isEditing && (
            <button className="btn btn-secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Clients List</h2>

        {clients.length === 0 ? (
          <p className="muted">No clients added yet.</p>
        ) : (
          <div className="client-list">
            {clients.map((c) => (
              <div className="client-card" key={c.id}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>{c.name}</h3>
                  <p style={{ margin: '6px 0' }}><strong>Email:</strong> {c.email}</p>
                  <p style={{ margin: '6px 0' }}><strong>Phone:</strong> {c.phone}</p>
                  <p style={{ margin: '6px 0' }}><strong>Company:</strong> {c.company}</p>
                </div>

                <div className="client-actions">
                  <button className="btn btn-edit" type="button" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}