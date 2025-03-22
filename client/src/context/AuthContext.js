"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "../firebase/config"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sign up with email and password
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // Login with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Login with Google
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  // Login with GitHub
  const loginWithGithub = () => {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }

  // Logout
  const logout = () => {
    return signOut(auth)
  }

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

