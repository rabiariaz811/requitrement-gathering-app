import { useEffect, useState } from 'react'
import type { DocumentItem } from '../types'
import { loadFromStorage, saveToStorage } from '../lib/storage'
import { idbDeleteFile, idbGetFile, idbPutFile } from '../lib/idbFiles'

const STORAGE_KEY = 'documents'
const id = () => crypto.randomUUID()

function normalize(raw: unknown): DocumentItem[] {
  if (!Array.isArray(raw)) return []
  const now = new Date().toISOString()
  return raw.map((x) => {
    const d = x as Partial<DocumentItem>
    return {
      id: String(d.id ?? id()),
      projectId: String(d.projectId ?? ''),
      requirementId: d.requirementId ? String(d.requirementId) : undefined,
      title: String(d.title ?? ''),
      fileName: String(d.fileName ?? 'file.pdf'),
      mimeType: String(d.mimeType ?? 'application/pdf'),
      size: Number(d.size ?? 0),
      fileId: String(d.fileId ?? id()),
      createdAt: String(d.createdAt ?? now),
    }
  })
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => normalize(loadFromStorage(STORAGE_KEY, [])))
  useEffect(() => saveToStorage(STORAGE_KEY, documents), [documents])

  const addDocument = async (input: { projectId: string; requirementId?: string; title: string; file: File }) => {
    const now = new Date().toISOString()
    const docId = id()
    const fileId = id()
    await idbPutFile(fileId, input.file)

    const item: DocumentItem = {
      id: docId,
      projectId: input.projectId,
      requirementId: input.requirementId || undefined,
      title: input.title,
      fileName: input.file.name,
      mimeType: input.file.type || 'application/pdf',
      size: input.file.size,
      fileId,
      createdAt: now,
    }

    setDocuments((p) => [item, ...p])
  }

  const deleteDocument = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    if (doc) await idbDeleteFile(doc.fileId)
    setDocuments((p) => p.filter((d) => d.id !== docId))
  }

  const getDocumentBlob = async (doc: DocumentItem) => await idbGetFile(doc.fileId)

  return { documents, addDocument, deleteDocument, getDocumentBlob }
}