"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import "../styles/Sidebar.css"

const Sidebar = ({ files, activeFile, onFileSelect, onCreateFile, onDeleteFile, onRenameFile }) => {
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [editingFileId, setEditingFileId] = useState(null)
  const [editingFileName, setEditingFileName] = useState("")

  const handleCreateFile = () => {
    setIsCreatingFile(true)
    setNewFileName("")
  }

  const handleCreateFileSubmit = (e) => {
    e.preventDefault()
    if (!newFileName.trim()) return

    // Determine language based on file extension
    const extension = newFileName.split(".").pop()
    let language = "javascript"

    if (extension === "html") language = "html"
    else if (extension === "css") language = "css"
    else if (extension === "json") language = "json"
    else if (extension === "md") language = "markdown"
    else if (["js", "jsx"].includes(extension)) language = "javascript"
    else if (["ts", "tsx"].includes(extension)) language = "typescript"
    else if (["py"].includes(extension)) language = "python"
    else if (["c", "cpp", "h"].includes(extension)) language = "cpp"

    onCreateFile(newFileName, language)
    setIsCreatingFile(false)
  }

  const handleStartRename = (file) => {
    setEditingFileId(file.id)
    setEditingFileName(file.name)
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault()
    if (!editingFileName.trim()) return

    onRenameFile(editingFileId, editingFileName)
    setEditingFileId(null)
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()

    if (extension === "html") return "🌐"
    if (extension === "css") return "🎨"
    if (extension === "js") return "📜"
    if (extension === "jsx") return "⚛️"
    if (extension === "ts" || extension === "tsx") return "📘"
    if (extension === "json") return "📋"
    if (extension === "md") return "📝"
    if (extension === "py") return "🐍"
    if (extension === "c" || extension === "cpp" || extension === "h") return "⚙️"

    return "📄"
  }

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sidebar-header">
        <h3>Files</h3>
        <button className="icon-button" onClick={handleCreateFile} title="Create new file">
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="files-list">
        {files.map((file) => (
          <div key={file.id} className={`file-item ${activeFile?.id === file.id ? "active" : ""}`}>
            {editingFileId === file.id ? (
              <form onSubmit={handleRenameSubmit} className="rename-form">
                <input
                  type="text"
                  value={editingFileName}
                  onChange={(e) => setEditingFileName(e.target.value)}
                  autoFocus
                  onBlur={handleRenameSubmit}
                />
              </form>
            ) : (
              <>
                <div className="file-name" onClick={() => onFileSelect(file)}>
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  {file.name}
                </div>
                <div className="file-actions">
                  <button className="icon-button small" onClick={() => handleStartRename(file)} title="Rename file">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="icon-button small" onClick={() => onDeleteFile(file.id)} title="Delete file">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {isCreatingFile && (
          <form onSubmit={handleCreateFileSubmit} className="new-file-form">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.ext"
              autoFocus
              onBlur={() => setIsCreatingFile(false)}
            />
          </form>
        )}
      </div>
    </motion.div>
  )
}

export default Sidebar

