import { useEffect, useState } from 'react'
import type { Project, ProjectInput } from '../types'
import { loadFromStorage, saveToStorage } from '../lib/storage'

const STORAGE_KEY = 'projects'
const id = () => crypto.randomUUID()

function normalize(raw: unknown): Project[] {
  if (!Array.isArray(raw)) return []
  const now = new Date().toISOString()
  return raw.map((x) => {
    const p = x as Partial<Project>
    return {
      id: String(p.id ?? id()),
      clientId: String(p.clientId ?? ''),
      name: String(p.name ?? ''),
      description: String(p.description ?? ''),
      status: (p.status as Project['status']) ?? 'Planned',
      createdAt: String(p.createdAt ?? now),
      updatedAt: String(p.updatedAt ?? now),
    }
  })
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => normalize(loadFromStorage(STORAGE_KEY, [])))
  useEffect(() => saveToStorage(STORAGE_KEY, projects), [projects])

  const addProject = (input: ProjectInput) => {
    const now = new Date().toISOString()
    const p: Project = { id: id(), ...input, createdAt: now, updatedAt: now }
    setProjects((prev) => [p, ...prev])
  }

  const updateProject = (projectId: string, input: ProjectInput) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...input, updatedAt: new Date().toISOString() } : p))
    )
  }

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  const getProjectById = (projectId: string) => projects.find((p) => p.id === projectId) ?? null

  return { projects, addProject, updateProject, deleteProject, getProjectById }
}