import { useEffect, useState } from 'react'
import type { Requirement, RequirementInput, RequirementAttachment } from '../types'
import { loadFromStorage, saveToStorage } from '../lib/storage'

const STORAGE_KEY = 'requirements'
const id = () => crypto.randomUUID()

function normalizeAttachments(raw: unknown): RequirementAttachment[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => {
      const a = x as Partial<RequirementAttachment>
      return {
        id: String(a.id ?? id()),
        name: String(a.name ?? 'image'),
        type: String(a.type ?? 'image/*'),
        size: Number(a.size ?? 0),
        dataUrl: String(a.dataUrl ?? ''),
        createdAt: String(a.createdAt ?? new Date().toISOString()),
      }
    })
    .filter((a) => a.dataUrl)
}

function normalize(raw: unknown): Requirement[] {
  if (!Array.isArray(raw)) return []
  const now = new Date().toISOString()
  return raw.map((x) => {
    const r = x as Partial<Requirement>
    return {
      id: String(r.id ?? id()),
      projectId: String(r.projectId ?? ''),
      title: String(r.title ?? ''),
      description: String(r.description ?? ''),
      priority: (r.priority as Requirement['priority']) ?? 'Medium',
      status: (r.status as Requirement['status']) ?? 'Draft',
      attachments: normalizeAttachments((r as any).attachments),
      createdAt: String(r.createdAt ?? now),
      updatedAt: String(r.updatedAt ?? now),
    }
  })
}

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>(() => normalize(loadFromStorage(STORAGE_KEY, [])))
  useEffect(() => saveToStorage(STORAGE_KEY, requirements), [requirements])

  const addRequirement = (input: RequirementInput) => {
    const now = new Date().toISOString()
    const r: Requirement = { id: id(), ...input, createdAt: now, updatedAt: now }
    setRequirements((p) => [r, ...p])
  }

  const updateRequirement = (reqId: string, input: RequirementInput) => {
    setRequirements((p) =>
      p.map((r) => (r.id === reqId ? { ...r, ...input, updatedAt: new Date().toISOString() } : r))
    )
  }

  const deleteRequirement = (reqId: string) => {
    setRequirements((p) => p.filter((r) => r.id !== reqId))
  }

  return { requirements, addRequirement, updateRequirement, deleteRequirement }
}