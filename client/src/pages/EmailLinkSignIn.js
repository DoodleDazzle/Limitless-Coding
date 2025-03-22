import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"

const EmailLinkSignIn = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const { checkEmailLink, signInWithEmail } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const completeSignIn = async () => {
      if (checkEmailLink(window.location.href)) {
        let emailFromStorage = window.localStorage.getItem('emailForSignIn')
        
        if (!emailFromStorage) {
          emailFromStorage = window.prompt('Please provide your email for confirmation')
        }

        try {
          await signInWithEmail(emailFromStorage, window.location.href)
          navigate("/")
        } catch (error) {
          setError(error.message)
        }
      }
      setLoading(false)
    }

    completeSignIn()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="auth-container">
      {error && <div className="auth-error">{error}</div>}
    </div>
  )
}

export default EmailLinkSignIn
