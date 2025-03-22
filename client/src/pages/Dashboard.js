"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { nanoid } from "nanoid"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase/config"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRooms = async () => {
      if (!currentUser) return

      try {
        const roomsRef = collection(db, "rooms")
        const q = query(
          roomsRef,
          where("participants", "array-contains", currentUser.uid),
          orderBy("lastActive", "desc"),
        )

        const querySnapshot = await getDocs(q)
        const roomsList = []

        querySnapshot.forEach((doc) => {
          roomsList.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setRooms(roomsList)
      } catch (error) {
        console.error("Error fetching rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [currentUser])

  const handleCreateRoom = () => {
    const roomId = nanoid(10)
    navigate(`/editor/${roomId}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <Link to="/" className="dashboard-logo">
          <span className="logo-icon">{"</>"}</span>
          <span className="logo-text">CodeCollab AI</span>
        </Link>

        <div className="nav-actions">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser.displayName
                ? currentUser.displayName.charAt(0).toUpperCase()
                : currentUser.email.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{currentUser.displayName || currentUser.email}</span>
          </div>

          <button className="nav-button secondary" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Coding Rooms</h1>
          <button className="dashboard-button primary" onClick={handleCreateRoom}>
            <i className="fas fa-plus"></i>
            Create New Room
          </button>
        </div>

        <div className="rooms-container">
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading your rooms...</span>
            </div>
          ) : rooms.length > 0 ? (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  className="room-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="room-header">
                    <h3 className="room-name">{room.name || `Room ${room.id.substring(0, 6)}`}</h3>
                    <span className="room-date">{new Date(room.lastActive.toDate()).toLocaleDateString()}</span>
                  </div>

                  <div className="room-info">
                    <div className="room-stats">
                      <div className="stat">
                        <i className="fas fa-file-code"></i>
                        <span>{room.fileCount || 0} files</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-users"></i>
                        <span>{room.participantCount || 1} users</span>
                      </div>
                    </div>

                    <div className="room-languages">
                      {room.languages &&
                        room.languages.map((lang, index) => (
                          <span key={index} className="language-tag">
                            {lang}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="room-actions">
                    <Link to={`/editor/${room.id}`} className="room-button primary">
                      <i className="fas fa-code"></i>
                      Open Editor
                    </Link>
                    <button className="room-button secondary">
                      <i className="fas fa-share-alt"></i>
                      Share
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-folder-open"></i>
              </div>
              <h2>No rooms yet</h2>
              <p>Create a new room to start coding collaboratively</p>
              <button className="dashboard-button primary" onClick={handleCreateRoom}>
                <i className="fas fa-plus"></i>
                Create First Room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

