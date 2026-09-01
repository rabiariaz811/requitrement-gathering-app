import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Requirement } from '../types'

function safeName(s: string) {
  return s.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60)
}

export function exportRequirementsPdf(opts: {
  requirements: Requirement[]
  reportTitle?: string
  clientLabel?: string
  projectLabel?: string
  getProjectLabel: (projectId: string) => string
}) {
  const { requirements, reportTitle, clientLabel, projectLabel, getProjectLabel } = opts

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 40
  let y = 50

  doc.setFontSize(18)
  doc.text(reportTitle ?? 'Requirements Report', marginX, y)
  y += 18

  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y)
  y += 16

  if (clientLabel) { doc.text(`Client: ${clientLabel}`, marginX, y); y += 16 }
  if (projectLabel) { doc.text(`Project: ${projectLabel}`, marginX, y); y += 16 }

  doc.text(`Total Requirements: ${requirements.length}`, marginX, y)
  y += 18

  autoTable(doc, {
    startY: y,
    head: [['#', 'Project', 'Title', 'Priority', 'Status', 'Description']],
    body: requirements.map((r, idx) => [
      String(idx + 1),
      getProjectLabel(r.projectId),
      r.title,
      r.priority,
      r.status,
      r.description || '',
    ]),
    styles: { fontSize: 9, cellPadding: 4, valign: 'top' },
    headStyles: { fillColor: [37, 99, 235] },
  })

  const date = new Date().toISOString().slice(0, 10)
  const nameParts = [
    'requirements',
    clientLabel ? safeName(clientLabel) : '',
    projectLabel ? safeName(projectLabel) : '',
    date,
  ].filter(Boolean)

  doc.save(`${nameParts.join('_')}.pdf`)
}