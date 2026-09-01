import { useEffect, useState } from 'react'
import type { Client, ClientInput } from '../types'
import { loadFromStorage, saveToStorage } from '../lib/storage'

const STORAGE_KEY = 'clients'
const id = () => crypto.randomUUID()

function normalize(raw: unknown): Client[] {
  if (!Array.isArray(raw)) return []
  const now = new Date().toISOString()
  return raw.map((x) => {
    const c = x as Partial<Client>
    return {
      id: String(c.id ?? id()),
      name: String(c.name ?? ''),
      email: String(c.email ?? ''),
      phone: String(c.phone ?? ''),
      company: String(c.company ?? ''),
      createdAt: String((c as any).createdAt ?? now),
      updatedAt: String((c as any).updatedAt ?? now),
    }
  })
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => normalize(loadFromStorage(STORAGE_KEY, [])))

  useEffect(() => saveToStorage(STORAGE_KEY, clients), [clients])

  const addClient = (input: ClientInput) => {
    const now = new Date().toISOString()
    const c: Client = { id: id(), ...input, createdAt: now, updatedAt: now }
    setClients((p) => [c, ...p])
  }

  const updateClient = (clientId: string, input: ClientInput) => {
    setClients((p) =>
      p.map((c) => (c.id === clientId ? { ...c, ...input, updatedAt: new Date().toISOString() } : c))
    )
  }

  const deleteClient = (clientId: string) => {
    setClients((p) => p.filter((c) => c.id !== clientId))
  }

  return { clients, addClient, updateClient, deleteClient }
}