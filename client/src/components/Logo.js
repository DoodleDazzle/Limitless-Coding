import { Link } from "react-router-dom"
import "../styles/Logo.css"

const Logo = () => {
  return (
    <div className="logo-container">
      <Link to="/" className="logo">
        <span className="logo-icon">{"</>"}</span>
        <span className="logo-text">CodeCollab</span>
      </Link>
    </div>
  )
}

export default Logo

