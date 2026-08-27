function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Requirement Gathering System</p>

      <div className="cards">
        <div className="card">
          <h3>Projects</h3>
          <p>0</p>
        </div>

        <div className="card">
          <h3>Clients</h3>
          <p>0</p>
        </div>

        <div className="card">
          <h3>Requirements</h3>
          <p>0</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
