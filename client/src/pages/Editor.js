"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { motion } from "framer-motion"
import Sidebar from "../components/Sidebar"
import Toolbar from "../components/Toolbar"
import Terminal from "../components/Terminal"
import UserPresence from "../components/UserPresence"
import "../styles/Editor.css"
import { useAuth } from "../context/AuthContext"

const Editor = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [files, setFiles] = useState([
    {
      id: "index.html",
      name: "index.html",
      language: "html",
      value:
        "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>",
    },
    {
      id: "styles.css",
      name: "styles.css",
      language: "css",
      value:
        "body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}",
    },
    {
      id: "script.js",
      name: "script.js",
      language: "javascript",
      value:
        'console.log("Hello, World!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("DOM loaded");\n});',
    },
  ])
  const [activeFile, setActiveFile] = useState(files[0])
  const [users, setUsers] = useState([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const editorRef = useRef(null)
  const { currentUser } = useAuth()
  const username = currentUser?.displayName || currentUser?.email || "Anonymous"

  useEffect(() => {
    const socketInstance = io("http://localhost:5000", {
      query: {
        roomId,
        username,
        userId: currentUser?.uid || "anonymous-user",
      },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to server")
    })

    socketInstance.on("room-users", (roomUsers) => {
      setUsers(roomUsers)
    })

    socketInstance.on("file-change", ({ fileId, value }) => {
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, value } : file)))

      if (activeFile.id === fileId && editorRef.current) {
        // Only update if the current model value is different to avoid cursor jumping
        const currentValue = editorRef.current.getValue()
        if (currentValue !== value) {
          editorRef.current.setValue(value)
        }
      }
    })

    socketInstance.on("new-file", (file) => {
      setFiles((prevFiles) => [...prevFiles, file])
    })

    socketInstance.on("delete-file", (fileId) => {
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file.id !== fileId)
        if (activeFile.id === fileId && updatedFiles.length > 0) {
          setActiveFile(updatedFiles[0])
        } else if (activeFile.id === fileId && updatedFiles.length === 0) {
          // Handle the case where there are no files left.  Ideally, create a default file.
          // For now, we'll just leave the editor blank.
          setActiveFile(null)
        }
        return updatedFiles
      })
    })

    socketInstance.on("rename-file", ({ fileId, newName }) => {
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))
    })

    socketInstance.on("terminal-output", (output) => {
      setTerminalOutput((prev) => [...prev, output])
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [roomId, username, currentUser])

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
  }

  const handleEditorChange = (value) => {
    if (!socket || !activeFile) return

    // Update local state
    setFiles((prevFiles) => prevFiles.map((file) => (file.id === activeFile.id ? { ...file, value } : file)))

    // Send to server
    socket.emit("file-change", {
      roomId,
      fileId: activeFile.id,
      value,
    })
  }

  const handleFileSelect = (file) => {
    setActiveFile(file)
  }

  const handleCreateFile = (fileName, language = "javascript") => {
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      language,
      value: "",
    }

    setFiles((prev) => [...prev, newFile])
    setActiveFile(newFile)

    if (socket) {
      socket.emit("new-file", { roomId, file: newFile })
    }
  }

  const handleDeleteFile = (fileId) => {
    if (files.length <= 1) {
      alert("Cannot delete the last file")
      return
    }

    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== fileId)
      if (activeFile.id === fileId && updatedFiles.length > 0) {
        setActiveFile(updatedFiles.find((file) => file.id !== fileId) || null) // Select another file or null if none left
      } else if (activeFile.id === fileId && updatedFiles.length === 0) {
        setActiveFile(null)
      }
      return updatedFiles
    })

    if (socket) {
      socket.emit("delete-file", { roomId, fileId })
    }
  }

  const handleRenameFile = (fileId, newName) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))

    if (socket) {
      socket.emit("rename-file", { roomId, fileId, newName })
    }
  }

  const handleRunCode = () => {
    setIsTerminalOpen(true)
    setTerminalOutput((prev) => [...prev, { type: "command", text: "Running code..." }])

    if (socket) {
      socket.emit("run-code", {
        roomId,
        files: files.map((f) => ({ name: f.name, content: f.value })),
      })
    }
  }

  const handleLeaveRoom = () => {
    navigate("/")
  }

  const toggleTerminal = () => {
    setIsTerminalOpen((prev) => !prev)
  }

  const togglePreview = () => {
    setIsPreviewOpen((prev) => !prev)
  }

  return (
    <div className="editor-container">
      <Toolbar
        roomId={roomId}
        onRun={handleRunCode}
        onToggleTerminal={toggleTerminal}
        onTogglePreview={togglePreview}
        onLeaveRoom={handleLeaveRoom}
        isTerminalOpen={isTerminalOpen}
        isPreviewOpen={isPreviewOpen}
      />

      <div className="editor-main">
        <Sidebar
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
        />

        <div className="editor-content">
          <motion.div
            className="monaco-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MonacoEditor
              height="100%"
              language={activeFile?.language || "javascript"}
              value={activeFile?.value || ""}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
                fontSize: 14,
                lineHeight: 1.5,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                scrollbar: {
                  useShadows: false,
                  verticalHasArrows: true,
                  horizontalHasArrows: true,
                  vertical: "visible",
                  horizontal: "visible",
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
              }}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
            />
          </motion.div>

          {isPreviewOpen && (
            <div className="preview-container">
              <iframe
                title="Preview"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>${files.find((f) => f.name.endsWith(".css"))?.value || ""}</style>
                    </head>
                    <body>
                      ${files.find((f) => f.name.endsWith(".html"))?.value || ""}
                      <script>${files.find((f) => f.name.endsWith(".js"))?.value || ""}</script>
                    </body>
                  </html>
                `}
                sandbox="allow-scripts"
                width="100%"
                height="100%"
              />
            </div>
          )}
        </div>
      </div>

      {isTerminalOpen && <Terminal output={terminalOutput} onClose={() => setIsTerminalOpen(false)} />}

      <UserPresence users={users} />
    </div>
  )
}

export default Editor

