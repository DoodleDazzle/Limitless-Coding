"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "../styles/Terminal.css"

const Terminal = ({ output, onClose, terminals, activeTerminal, onTerminalCreate, onTerminalSelect }) => {
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <AnimatePresence>
      <motion.div
        className="terminal-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="terminal-header">
          <h3>Terminal</h3>
          <button className="icon-button small" onClick={onClose} title="Close Terminal">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="terminal-content" ref={terminalRef}>
          {output.map((item, index) => (
            <div
              key={index}
              className={`terminal-line ${item.type === "error" ? "error" : item.type === "command" ? "command" : ""}`}
            >
              {item.type === "command" && <span className="terminal-prompt">$ </span>}
              {item.text}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Terminal

