import { useState } from 'react'

type Project = {
  id: number
  name: string
  client: string
  description: string
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [description, setDescription] = useState('')

  const addProject = () => {
    if (!name || !client) {
      alert('Please enter project name and client name')
      return
    }

    const newProject: Project = {
      id: Date.now(),
      name,
      client,
      description,
    }

    setProjects([...projects, newProject])

    setName('')
    setClient('')
    setDescription('')
  }

  return (
    <div>
      <h1>Projects</h1>
      <p>Create and manage your projects.</p>

      <div className="project-form">
        <h2>Create New Project</h2>

        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Client Name"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={addProject}>Create Project</button>
      </div>

      <div className="project-list">
        <h2>Projects List</h2>

        {projects.length === 0 ? (
          <p>No projects created yet.</p>
        ) : (
          projects.map((project) => (
            <div className="project-card" key={project.id}>
              <h3>{project.name}</h3>
              <p>
                <strong>Client:</strong> {project.client}
              </p>
              <p>{project.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Projects