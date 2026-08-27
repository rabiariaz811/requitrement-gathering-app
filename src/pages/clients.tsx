import { useEffect, useState } from 'react'

type Client = {
  id: number
  name: string
  email: string
  phone: string
  company: string
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients')
    return saved ? (JSON.parse(saved) as Client[]) : []
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients))
  }, [clients])

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setEditingId(null)
  }

  const addOrUpdateClient = () => {
    if (!name || !email || !phone || !company) {
      alert('Please fill in all fields')
      return
    }

    if (editingId !== null) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === editingId
            ? { ...client, name, email, phone, company }
            : client
        )
      )
      resetForm()
      return
    }

    const newClient: Client = {
      id: Date.now(),
      name,
      email,
      phone,
      company,
    }

    setClients((prev) => [...prev, newClient])
    resetForm()
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    setName(client.name)
    setEmail(client.email)
    setPhone(client.phone)
    setCompany(client.company)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteClient = (id: number) => {
    const ok = confirm('Delete this client?')
    if (!ok) return

    setClients((prev) => prev.filter((c) => c.id !== id))

    if (editingId === id) {
      resetForm()
    }
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
        <h2 className="card-title">
          {editingId !== null ? 'Edit Client' : 'Add New Client'}
        </h2>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Client Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={addOrUpdateClient}>
            {editingId !== null ? 'Update Client' : 'Add Client'}
          </button>

          {editingId !== null && (
            <button className="btn btn-secondary" onClick={resetForm}>
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
            {clients.map((client) => (
              <div className="client-card" key={client.id}>
                <div className="client-info">
                  <h3>{client.name}</h3>
                  <p>
                    <strong>Email:</strong> {client.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {client.phone}
                  </p>
                  <p>
                    <strong>Company:</strong> {client.company}
                  </p>
                </div>

                <div className="client-actions">
                  <button
                    className="btn btn-edit"
                    type="button"
                    onClick={() => startEdit(client)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => deleteClient(client.id)}
                  >
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