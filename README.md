# CodeCollab - Real-time Collaborative Code Editor

## Real-time Collaboration Implementation

This application uses a hybrid approach for real-time collaboration:

1. **Yjs + WebRTC** for peer-to-peer conflict-free real-time collaboration
2. **Socket.IO** as a fallback and for non-document operations (user presence, terminal, etc.)

### Key Features

- **Conflict-free Editing**: Multiple users can edit the same file simultaneously without conflicts
- **Cursor Awareness**: See other users' cursors and selections
- **File Operations**: Create, rename, and delete files with real-time sync
- **Terminal Output**: Share terminal output across all clients
- **Resilient Synchronization**: P2P with server fallback for reliability

### Implementation Details

The real-time collaboration is handled by:

1. **websocket.js**: Client-side service that:
   - Creates and manages a Yjs document
   - Sets up WebRTC provider for P2P communication
   - Binds Monaco Editor to Yjs for synchronization
   - Falls back to Socket.IO when needed

2. **server/index.js**: Server-side implementation that:
   - Manages room and user state
   - Provides signaling for WebRTC peers
   - Stores file content state for new users
   - Handles terminal commands and code execution

3. **Editor.js**: Main editor component that:
   - Integrates the websocket service with the UI
   - Manages file selection, creation, and editing
   - Sets up Yjs bindings when files are selected

### Troubleshooting

If collaboration issues occur:

1. Check the console for WebRTC connection errors
2. Ensure the signaling servers are accessible
3. Verify the server is running and accessible
4. Check that all clients are connected to the same room

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn
- Modern browser with WebRTC support

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd client
npm install
```

### Running the Application

```bash
# Start the server
cd server
npm run dev

# Start the client in a separate terminal
cd client
npm start
```

Visit http://localhost:3000 to use the application. 