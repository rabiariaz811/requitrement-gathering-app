import { Link, useParams } from 'react-router-dom'

function ProjectDetails() {
  const { id } = useParams()

  return (
    <div>
      <h1>Project Details</h1>

      <p>
        <strong>Project ID:</strong> {id}
      </p>

      <hr />

      <h2>Project Information</h2>

      <p>
        Project information will appear here.
      </p>

      <hr />

      <h2>Requirements</h2>

      <p>
        No requirements added yet.
      </p>

      <hr />

      <h2>Documents</h2>

      <p>
        No documents added yet.
      </p>

      <br />

      <Link to="/projects">
        ← Back to Projects
      </Link>
    </div>
  )
}

export default ProjectDetails
