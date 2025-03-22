"use client"
import { motion } from "framer-motion"
import "../styles/UserPresence.css"

const UserPresence = ({ users }) => {
  const getRandomColor = (username) => {
    // Generate a consistent color based on username
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = hash % 360
    return `hsl(${hue}, 70%, 60%)`
  }

  return (
    <motion.div
      className="user-presence"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="users-list">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            className="user-avatar"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            style={{
              backgroundColor: getRandomColor(user.username),
              zIndex: users.length - index,
            }}
            title={user.username}
          >
            {user.username.charAt(0).toUpperCase()}
          </motion.div>
        ))}
      </div>

      <div className="users-count">
        {users.length} user{users.length !== 1 ? "s" : ""} online
      </div>
    </motion.div>
  )
}

export default UserPresence

