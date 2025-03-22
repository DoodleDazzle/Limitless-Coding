"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import "../styles/Auth.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setMessage("")
      setError("")
      setLoading(true)
      await resetPassword(email)
      setMessage("Check your email for further instructions")
    } catch (err) {
      setError("Failed to reset password")
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <Link to="/" className="auth-logo">
        <span className="logo-icon">{"</>"}</span>
        <span className="logo-text">CodeCollab AI</span>
      </Link>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <button type="submit" className="auth-button primary" disabled={loading}>
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword

