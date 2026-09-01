// Clients
export type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
  updatedAt: string
}
export type ClientInput = {
  name: string
  email: string
  phone: string
  company: string
}

// Projects
export type ProjectStatus = 'Planned' | 'In Progress' | 'On Hold' | 'Done'
export type Project = {
  id: string
  clientId: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}
export type ProjectInput = {
  clientId: string
  name: string
  description: string
  status: ProjectStatus
}

// Requirements + Photos
export type RequirementAttachment = {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
}
export type RequirementPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type RequirementStatus = 'Draft' | 'Approved' | 'In Development' | 'Done'
export type Requirement = {
  id: string
  projectId: string
  title: string
  description: string
  priority: RequirementPriority
  status: RequirementStatus
  attachments: RequirementAttachment[]
  createdAt: string
  updatedAt: string
}
export type RequirementInput = {
  projectId: string
  title: string
  description: string
  priority: RequirementPriority
  status: RequirementStatus
  attachments: RequirementAttachment[]
}

// Documents (PDF metadata)
export type DocumentItem = {
  id: string
  projectId: string
  requirementId?: string
  title: string
  fileName: string
  mimeType: string
  size: number
  fileId: string
  createdAt: string
}