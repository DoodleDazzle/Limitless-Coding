"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import "../styles/Auth.css"

const Signup = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup, loginWithGoogle, loginWithGithub, currentUser, authError } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate("/create")
    }
  }, [currentUser, navigate])

  // Set error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    try {
      setError("")
      setLoading(true)
      await signup(email, password)
      navigate("/create")
    } catch (err) {
      // Error is set from authError in useEffect
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setError("")
      setLoading(true)
      await loginWithGoogle()
      navigate("/create")
    } catch (err) {
      // Error is set from authError in useEffect
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignUp = async () => {
    try {
      setError("")
      setLoading(true)
      await loginWithGithub()
      navigate("/create")
    } catch (err) {
      // Error is set from authError in useEffect
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <Link to="/">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 28C9.373 28 4 22.627 4 16C4 9.373 9.373 4 16 4C22.627 4 28 9.373 28 16C28 22.627 22.627 28 16 28Z"
                fill="#6366F1"
              />
              <path
                d="M16 8C11.582 8 8 11.582 8 16C8 20.418 11.582 24 16 24C20.418 24 24 20.418 24 16C24 11.582 20.418 8 16 8ZM16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22Z"
                fill="#6366F1"
              />
              <path
                d="M16 12C13.791 12 12 13.791 12 16C12 18.209 13.791 20 16 20C18.209 20 20 18.209 20 16C20 13.791 18.209 12 16 12ZM16 18C14.895 18 14 17.105 14 16C14 14.895 14.895 14 16 14C17.105 14 18 14.895 18 16C18 17.105 17.105 18 16 18Z"
                fill="#6366F1"
              />
            </svg>
            <span>CodeCollab AI</span>
          </Link>
        </div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Create an account</h1>
          <p className="auth-subtitle">Start coding together with AI assistance</p>

          <div className="social-auth">
            <button className="social-button github" onClick={handleGithubSignUp} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.5 21.278 9.5 21.017C9.5 20.778 9.492 20.055 9.489 19.203C6.728 19.861 6.139 17.875 6.139 17.875C5.684 16.71 5.029 16.408 5.029 16.408C4.139 15.777 5.098 15.79 5.098 15.79C6.082 15.859 6.609 16.825 6.609 16.825C7.5 18.39 8.969 17.921 9.52 17.669C9.609 17.023 9.859 16.554 10.134 16.292C7.93 16.027 5.62 15.185 5.62 11.328C5.62 10.226 6.01 9.325 6.629 8.622C6.53 8.375 6.189 7.379 6.729 6.038C6.729 6.038 7.564 5.773 9.477 7.031C10.29 6.812 11.15 6.703 12.004 6.699C12.857 6.703 13.716 6.812 14.531 7.031C16.444 5.773 17.277 6.038 17.277 6.038C17.819 7.379 17.477 8.375 17.379 8.622C17.999 9.325 18.386 10.226 18.386 11.328C18.386 15.196 16.072 16.023 13.859 16.284C14.205 16.608 14.516 17.25 14.516 18.227C14.516 19.602 14.505 20.686 14.505 21.017C14.505 21.281 14.664 21.587 15.173 21.487C19.138 20.161 22 16.416 22 12C22 6.477 17.523 2 12 2Z"
                  fill="currentColor"
                />
              </svg>
              GitHub
            </button>

            <button className="social-button google" onClick={handleGoogleSignUp} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                  fill="#FFC107"
                />
                <path
                  d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z"
                  fill="#FF3D00"
                />
                <path
                  d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z"
                  fill="#4CAF50"
                />
                <path
                  d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                  fill="#1976D2"
                />
              </svg>
              Google
            </button>
          </div>

          <div className="auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup

