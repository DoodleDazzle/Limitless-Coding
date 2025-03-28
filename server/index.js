const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const { exec, execSync } = require("child_process")
const fs = require("fs").promises
const path = require("path")
const os = require("os")

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Store rooms and their users
const rooms = new Map()

// Store file contents for each room
const fileContents = new Map()

// Temporary directory for code execution
const tempDir = path.join(os.tmpdir(), "codecollab")

// Create temp directory if it doesn't exist
async function ensureTempDir() {
  try {
    await fs.mkdir(tempDir, { recursive: true })
    console.log(`Temporary directory created at ${tempDir}`)
  } catch (err) {
    console.error("Error creating temp directory:", err)
  }
}

ensureTempDir()

// Update the socket connection handler to use Firebase UIDs
io.on("connection", (socket) => {
  const { roomId, username, userId } = socket.handshake.query
  const socketId = socket.id

  console.log(`User ${username} (${userId}) connected to room ${roomId}`)

  // Join the room
  socket.join(roomId)

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map())
  }

  // Add user to room with Firebase UID if available
  rooms.get(roomId).set(socketId, {
    username,
    userId: userId || socketId, // Use Firebase UID if available, otherwise socket ID
  })

  // Send current file contents to the new user if available
  if (fileContents.has(roomId)) {
    const roomFiles = fileContents.get(roomId);
    roomFiles.forEach((value, fileId) => {
      socket.emit("file-change", { fileId, value });
    });
  }

  // Broadcast updated user list to all clients in the room
  io.to(roomId).emit(
    "room-users",
    Array.from(rooms.get(roomId).entries()).map(([id, user]) => ({
      id,
      username: user.username,
    })),
  )

  // Handle file changes
  socket.on("file-change", ({ roomId, fileId, value }) => {
    // Store the value temporarily for new users who join later
    if (!fileContents) {
      fileContents = new Map();
    }
    
    // Keep track of the latest content for each file
    if (!fileContents.has(roomId)) {
      fileContents.set(roomId, new Map());
    }
    
    // Only update if there's actual value (some operations might not have content)
    if (value !== null && value !== undefined) {
      fileContents.get(roomId).set(fileId, value);
    }

    // Broadcast to all other clients in the room
    socket.to(roomId).emit("file-change", { fileId, value })
  })

  // Handle new file creation
  socket.on("new-file", ({ roomId, file }) => {
    // Store the file content for new users
    if (!fileContents) {
      fileContents = new Map();
    }
    
    if (!fileContents.has(roomId)) {
      fileContents.set(roomId, new Map());
    }
    
    fileContents.get(roomId).set(file.id, file.value);
    
    socket.to(roomId).emit("new-file", file)
  })

  // Handle file deletion
  socket.on("delete-file", ({ roomId, fileId }) => {
    socket.to(roomId).emit("delete-file", fileId)
  })

  // Handle file renaming
  socket.on("rename-file", ({ roomId, fileId, newName }) => {
    socket.to(roomId).emit("rename-file", { fileId, newName })
  })

  // Handle code execution
  socket.on("run-code", async ({ roomId, files }) => {
    try {
      // Create a temporary directory for this execution
      const execDir = path.join(tempDir, `${roomId}-${Date.now()}`)
      await fs.mkdir(execDir, { recursive: true })

      // Write files to disk
      for (const file of files) {
        await fs.writeFile(path.join(execDir, file.name), file.content)
      }

      let command = "";
      let env = process.env;

      // Check for installed compilers/interpreters
      const checkCommand = process.platform === 'win32' ? 'where' : 'which';
      
      if (files.some((f) => f.name.endsWith(".html"))) {
        io.to(roomId).emit("terminal-output", {
          type: "info",
          text: "HTML/CSS/JS detected. Use the Preview button to view the result.",
        })
        return
      } else if (files.some((f) => f.name.endsWith(".js"))) {
        try {
          execSync(`${checkCommand} node`);
          const mainFile = files.find((f) => f.name.endsWith(".js")).name;
          command = `node "${path.join(execDir, mainFile)}"`;
        } catch (error) {
          io.to(roomId).emit("terminal-output", {
            type: "error",
            text: "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/ and make sure it's added to your PATH.",
          });
          return;
        }
      } else if (files.some((f) => f.name.endsWith(".py"))) {
        try {
          // Try python3 first, then python
          try {
            execSync(`${checkCommand} python3`);
            const mainFile = files.find((f) => f.name.endsWith(".py")).name;
            command = `python3 "${path.join(execDir, mainFile)}"`;
          } catch {
            execSync(`${checkCommand} python`);
            const mainFile = files.find((f) => f.name.endsWith(".py")).name;
            command = `python "${path.join(execDir, mainFile)}"`;
          }
        } catch (error) {
          io.to(roomId).emit("terminal-output", {
            type: "error",
            text: "Python is not installed or not in PATH. Please install Python from https://www.python.org/ and make sure it's added to your PATH.",
          });
          return;
        }
      } else if (files.some((f) => f.name.endsWith(".cpp") || f.name.endsWith(".c"))) {
        try {
          execSync(`${checkCommand} g++`);
          const mainFile = files.find((f) => f.name.endsWith(".cpp") || f.name.endsWith(".c")).name;
          const outputFile = path.join(execDir, process.platform === 'win32' ? 'output.exe' : 'output');

          // Compile with better error handling
          try {
            await new Promise((resolve, reject) => {
              const compileCommand = `g++ "${path.join(execDir, mainFile)}" -o "${outputFile}"`;
              exec(compileCommand, { cwd: execDir }, (error, stdout, stderr) => {
                if (error) {
                  io.to(roomId).emit("terminal-output", { 
                    type: "error", 
                    text: `Compilation error:\n${stderr}` 
                  });
                  reject(error);
                  return;
                }
                resolve();
              });
            });

            command = `"${outputFile}"`;
          } catch (error) {
            return;
          }
        } catch (error) {
          io.to(roomId).emit("terminal-output", {
            type: "error",
            text: "G++ compiler is not installed or not in PATH. On Windows, install MinGW from https://mingw-w64.org/. On Linux, run 'sudo apt-get install build-essential'. Make sure it's added to your PATH.",
          });
          return;
        }
      } else {
        io.to(roomId).emit("terminal-output", {
          type: "error",
          text: "Unsupported file type. Currently supporting JavaScript, Python, and C/C++.",
        })
        return
      }

      // Execute the command with timeout
      if (command) {
        const child = exec(command, { 
          cwd: execDir,
          env: env,
          timeout: 10000 // 10 second timeout
        }, (error, stdout, stderr) => {
          if (error && error.killed) {
            io.to(roomId).emit("terminal-output", { 
              type: "error", 
              text: "Execution timed out after 10 seconds" 
            });
            return;
          }

          if (stdout) {
            io.to(roomId).emit("terminal-output", { type: "output", text: stdout });
          }

          if (stderr) {
            io.to(roomId).emit("terminal-output", { type: "error", text: stderr });
          }
        });

        // Clean up when done
        child.on('exit', async () => {
          try {
            await fs.rm(execDir, { recursive: true, force: true });
          } catch (err) {
            console.error("Error cleaning up temp directory:", err);
          }
        });
      }
    } catch (err) {
      console.error("Error running code:", err)
      io.to(roomId).emit("terminal-output", {
        type: "error",
        text: `Server error: ${err.message}`,
      })
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${username} (${userId}) disconnected from room ${roomId}`)

    // Remove user from room
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socketId)

      // If room is empty, remove it
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId)
        
        // Also clean up the file contents for this room
        if (fileContents && fileContents.has(roomId)) {
          fileContents.delete(roomId);
          console.log(`Cleaned up file contents for empty room ${roomId}`);
        }
      } else {
        // Broadcast updated user list
        io.to(roomId).emit(
          "room-users",
          Array.from(rooms.get(roomId).entries()).map(([id, user]) => ({
            id,
            username: user.username,
          })),
        )
      }
    }
  })
})

// API routes
app.get("/", (req, res) => {
  res.send("CodeCollab Server is running")
})

app.get("/api/rooms", (req, res) => {
  const roomsList = Array.from(rooms.entries()).map(([roomId, users]) => ({
    id: roomId,
    userCount: users.size,
  }))

  res.json(roomsList)
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

