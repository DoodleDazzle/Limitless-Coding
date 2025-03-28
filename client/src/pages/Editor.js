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
import CustomCursor from "../components/CustomCursor"
import DebugPanel from "../components/DebugPanel"
import { websocketService } from '../services/websocket'

const Editor = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [files, setFiles] = useState([
    {
      id: "index.html",
      name: "index.html",
      language: "html",
      value: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
    },
    {
      id: "styles.css",
      name: "styles.css",
      language: "css",
      value: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
}`,
    },
    {
      id: "script.js",
      name: "script.js",
      language: "javascript",
      value: `console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
});`,
    },
  ])
  const [activeFile, setActiveFile] = useState(files[0])
  const [users, setUsers] = useState([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef(null)
  const { currentUser } = useAuth()
  const username = currentUser?.displayName || currentUser?.email || "Anonymous"
  const [theme, setTheme] = useState("vs-dark")
  const [isDebugging, setIsDebugging] = useState(false)
  const [breakpoints, setBreakpoints] = useState([])
  const [terminals, setTerminals] = useState([{ id: 1, name: "Terminal 1" }])
  const [activeTerminal, setActiveTerminal] = useState(1)
  const [editorSettings] = useState({
    fontSize: 14,
    wordWrap: "on",
    minimap: { enabled: true },
    formatOnSave: true,
  })

  // Enable custom cursor
  useEffect(() => {
    document.body.classList.add("custom-cursor-active")

    return () => {
      document.body.classList.remove("custom-cursor-active")
    }
  }, [])

  useEffect(() => {
    websocketService.connect(roomId, username, currentUser?.uid || "anonymous-user")

    websocketService.on("room-users", (roomUsers) => {
      setUsers(roomUsers)
    })

    websocketService.on("file-change", ({ fileId, value }) => {
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, value } : file)))

      if (activeFile.id === fileId && editorRef.current) {
        // Only update if the current model value is different to avoid cursor jumping
        const currentValue = editorRef.current.getValue()
        if (currentValue !== value) {
          editorRef.current.setValue(value)
        }
      }
    })

    websocketService.on("new-file", (file) => {
      setFiles((prevFiles) => [...prevFiles, file])
    })

    websocketService.on("delete-file", (fileId) => {
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

    websocketService.on("rename-file", ({ fileId, newName }) => {
      setFiles((prevFiles) => prevFiles.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))
    })

    websocketService.on("terminal-output", (output) => {
      setTerminalOutput((prev) => [...prev, output])
      if (output.type === "command" && output.text === "Running code...") {
        setIsRunning(true)
      } else if (output.type === "output" || output.type === "error") {
        setIsRunning(false)
      }
    })

    websocketService.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    setSocket(websocketService)

    return () => {
      websocketService.disconnect()
    }
  }, [roomId, username, currentUser, activeFile])

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
    
    // Setup Yjs binding when editor mounts if we have an active file
    if (activeFile) {
      try {
        const binding = websocketService.setupEditorBinding(activeFile.id, editor);
        // If binding failed (returns null), we'll fallback to Socket.IO
        if (!binding) {
          console.log('Using Socket.IO fallback for synchronization');
        }
      } catch (error) {
        console.error('Failed to set up editor binding:', error);
      }
    }
  }

  const handleEditorChange = (value) => {
    if (!socket || !activeFile) return

    // Update local state
    setFiles((prevFiles) => prevFiles.map((file) => 
      file.id === activeFile.id ? { ...file, value } : file
    ))
    
    // Check if bindings map exists and if this file has a binding
    const hasBinding = websocketService.bindings && 
                      typeof websocketService.bindings.has === 'function' && 
                      websocketService.bindings.has(activeFile.id);
                      
    // If no Yjs binding exists, fall back to socket.io
    if (!hasBinding) {
      websocketService.handleFileChange(activeFile.id, value, {
        type: 'insert',
        position: editorRef.current.getPosition(),
        length: value.length - (editorRef.current.getValue()?.length || 0)
      });
    }
  }

  const handleFileSelect = (file) => {
    setActiveFile(file)
    
    // When switching files, set up Yjs binding for the new file
    if (editorRef.current) {
      try {
        setTimeout(() => {
          try {
            // Small timeout to ensure the editor model has changed
            websocketService.setupEditorBinding(file.id, editorRef.current);
          } catch (innerError) {
            console.error('Error setting up editor binding after delay:', innerError);
          }
        }, 50);
      } catch (error) {
        console.error('Error scheduling binding setup:', error);
      }
    }
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
      websocketService.handleFileChange(newFile.id, newFile.value, {
        type: 'new-file',
        name: fileName,
        language,
        position: 0,
        length: 0
      })
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
      websocketService.handleFileChange(fileId, null, {
        type: 'delete',
        position: 0,
        length: 0
      })
    }
  }

  const handleRenameFile = (fileId, newName) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))

    if (socket) {
      websocketService.handleFileChange(fileId, files.find(f => f.id === fileId).value, {
        type: 'rename',
        newName: newName
      })
    }
  }

  const handleRunCode = () => {
    setIsTerminalOpen(true);
    setTerminalOutput((prev) => [...prev, { type: "command", text: "Running code..." }]);

    if (socket) {
      // Get latest file content from the current state
      const currentFiles = files.map((f) => {
        try {
          // Safely check if bindings exists and has proper has method
          const hasBinding = websocketService.bindings && 
                            typeof websocketService.bindings.has === 'function' && 
                            websocketService.bindings.has(f.id);
                            
          // If there's a binding for this file, get the latest content from the editor
          if (hasBinding && f.id === activeFile.id && editorRef.current) {
            return { 
              name: f.name, 
              content: editorRef.current.getValue() 
            };
          }
        } catch (err) {
          console.error('Error checking bindings:', err);
        }
        
        // Fallback to using stored state value
        return { name: f.name, content: f.value };
      });
      
      socket.emit("run-code", {
        roomId,
        files: currentFiles
      });
    }
  }

  const handleLeaveRoom = () => {
    navigate("/")
  }

  const toggleTerminal = () => {
    setIsTerminalOpen(prev => !prev)
    if (!isTerminalOpen) {
      setTerminalOutput([]) // Clear terminal output when opening
    }
  }

  const togglePreview = () => {
    setIsPreviewOpen((prev) => !prev)
  }

  // Function to get HTML content
  const getHtmlContent = () => {
    const htmlFile = files.find((f) => f.name.endsWith(".html"))
    return htmlFile ? htmlFile.value : ""
  }

  // Function to get CSS content
  const getCssContent = () => {
    const cssFile = files.find((f) => f.name.endsWith(".css"))
    return cssFile ? cssFile.value : ""
  }

  // Function to get JavaScript content
  const getJsContent = () => {
    const jsFile = files.find((f) => f.name.endsWith(".js"))
    return jsFile ? jsFile.value : ""
  }

  // Editor options
  const editorOptions = {
    ...editorSettings,
    readOnly: isDebugging,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  }

  // Handle file operations
  const handleSaveFile = () => {
    if (!activeFile) return
    // Implement save logic
    websocketService.handleFileChange(activeFile.id, activeFile.value, {
      type: 'save',
      position: 0,
      length: 0
    })
  }

  const handleDuplicateFile = (file) => {
    const newFile = {
      ...file,
      id: Date.now().toString(),
      name: `${file.name.split(".")[0]}_copy.${file.name.split(".")[1]}`,
    }
    setFiles(prev => [...prev, newFile])
  }

  const startDebugging = () => {
    setIsDebugging(true)
    websocketService.handleFileChange(activeFile.id, null, {
      type: 'debug-start',
      position: 0,
      length: 0
    })
  }

  // Removed unused runCode function

  return (
    <div className="editor-container">
      <CustomCursor />

      <Toolbar
        roomId={roomId}
        onRun={handleRunCode}
        onToggleTerminal={toggleTerminal}
        onTogglePreview={togglePreview}
        onLeaveRoom={handleLeaveRoom}
        isTerminalOpen={isTerminalOpen}
        isPreviewOpen={isPreviewOpen}
        isRunning={isRunning}
        onSave={handleSaveFile}
        onDebug={startDebugging}
        isDebugging={isDebugging}
        theme={theme}
        onThemeChange={setTheme}
      />

      <div className="editor-main">
        <Sidebar
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onDuplicateFile={handleDuplicateFile}
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
              theme={theme}
              options={editorOptions}
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
                      <style>${getCssContent()}</style>
                    </head>
                    <body>
                      ${getHtmlContent()}
                      <script>${getJsContent()}</script>
                    </body>
                  </html>
                `}
                sandbox="allow-scripts"
                width="100%"
                height="100%"
              />
            </div>
          )}

          {isDebugging && (
            <DebugPanel
              breakpoints={breakpoints}
              onBreakpointChange={setBreakpoints}
              isDebugging={isDebugging}
              onStopDebugging={() => setIsDebugging(false)}
            />
          )}
        </div>
      </div>

      {isTerminalOpen && (
        <Terminal 
          output={terminalOutput}
          onClose={toggleTerminal}
          terminals={terminals}
          activeTerminal={activeTerminal}
          onTerminalCreate={() => {
            setTerminals(prev => [...prev, { 
              id: prev.length + 1, 
              name: `Terminal ${prev.length + 1}` 
            }])
          }}
          onTerminalSelect={setActiveTerminal}
        />
      )}

      <UserPresence users={users} />
    </div>
  )
}

export default Editor
