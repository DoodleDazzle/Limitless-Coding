"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import "../styles/Toolbar.css"

const Toolbar = ({ roomId, onRun, onToggleTerminal, onTogglePreview, onLeaveRoom, isTerminalOpen, isPreviewOpen }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <motion.div
      className="toolbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="toolbar-left">
        <div className="room-info">
          <span className="room-label">Room:</span>
          <span className="room-id">{roomId}</span>
          <button className="icon-button small" onClick={copyRoomId} title="Copy Room ID">
            {isCopied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
          </button>
        </div>
      </div>

      <div className="toolbar-center">
        <button className="toolbar-button" onClick={onRun} title="Run Code">
          <i className="fas fa-play"></i>
          <span>Run</span>
        </button>

        <button
          className={`toolbar-button ${isTerminalOpen ? "active" : ""}`}
          onClick={onToggleTerminal}
          title="Toggle Terminal"
        >
          <i className="fas fa-terminal"></i>
          <span>Terminal</span>
        </button>

        <button
          className={`toolbar-button ${isPreviewOpen ? "active" : ""}`}
          onClick={onTogglePreview}
          title="Toggle Preview"
        >
          <i className="fas fa-eye"></i>
          <span>Preview</span>
        </button>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-button leave-button" onClick={onLeaveRoom} title="Leave Room">
          <i className="fas fa-sign-out-alt"></i>
          <span>Leave</span>
        </button>
      </div>
    </motion.div>
  )
}

export default Toolbar

