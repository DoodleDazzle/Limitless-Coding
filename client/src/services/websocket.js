import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

// Create singleton service for WebSocket connections
class WebSocketService {
  constructor() {
    this.socket = null;
    this.ydoc = null;
    this.provider = null;
    this.bindings = new Map(); // Map of fileId -> MonacoBinding
    this.eventListeners = {};
    this.roomId = null;
    this.username = null;
    this.userId = null;
    this.isConnected = false;
    this.useFallbackMode = false; // Flag to indicate if we're in Socket.IO-only mode
  }

  // Connect to server
  connect(roomId, username, userId) {
    // Store connection params
    this.roomId = roomId;
    this.username = username;
    this.userId = userId;

    // Setup Socket.IO connection - this is our reliable fallback
    const serverUrl = process.env.REACT_APP_SOCKET_SERVER || 'https://code-ijfg.onrender.com';
    this.socket = io(serverUrl, {
      query: { roomId, username, userId },
    });

    // Set up Yjs with error handling
    this._setupYjs();

    // Forward socket events to subscribers
    this._setupSocketEvents();
    
    this.isConnected = true;
    return this;
  }

  // Set up Yjs document and WebRTC provider
  _setupYjs() {
    try {
      // Create Yjs document
      this.ydoc = new Y.Doc();
      
      // WebRTC provider for peer-to-peer collaboration
      this.provider = new WebrtcProvider(`codecollab-${this.roomId}`, this.ydoc, {
        signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com'],
        password: null,
        maxConns: 20,
        filterBcConns: false,
        peerOpts: {},
      });

      // Set local awareness state
      if (this.provider.awareness) {
        this.provider.awareness.setLocalState({
          user: {
            name: this.username,
            id: this.userId,
            color: this.getRandomColor(),
          }
        });
      } else {
        console.error('WebRTC provider awareness is not available - using fallback mode');
        this.useFallbackMode = true;
      }

      console.log('WebRTC provider initialized successfully');
    } catch (error) {
      console.error('Error initializing WebRTC provider - using fallback mode:', error);
      this.ydoc = null;
      this.provider = null;
      this.useFallbackMode = true;
    }
  }

  // Set up socket event listeners
  _setupSocketEvents() {
    if (!this.socket) return;

    // Handle raw Socket.IO events
    this.socket.on('room-users', (users) => {
      this._emitEvent('room-users', users);
    });

    this.socket.on('terminal-output', (output) => {
      this._emitEvent('terminal-output', output);
    });

    this.socket.on('new-file', (file) => {
      this._emitEvent('new-file', file);
    });

    this.socket.on('delete-file', (fileId) => {
      this._emitEvent('delete-file', fileId);
    });

    this.socket.on('rename-file', (data) => {
      this._emitEvent('rename-file', data);
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this._emitEvent('disconnect');
    });

    this.socket.on('file-change', ({ fileId, value }) => {
      // Check if we should handle this via Yjs or directly
      const hasBinding = !this.useFallbackMode && 
                        this.bindings && 
                        typeof this.bindings.has === 'function' && 
                        this.bindings.has(fileId);
                        
      // Only emit the event if we don't have a Yjs binding for this file
      if (!hasBinding) {
        this._emitEvent('file-change', { fileId, value });
      }
    });
  }

  // Create a color randomly but evenly distributed across the hue spectrum
  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
  }

  // Register event listener
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  // Emit event to registered listeners
  _emitEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }

  // Handle file changes with Yjs
  handleFileChange(fileId, value, changeInfo) {
    if (!this.socket || !this.isConnected) return;

    if (changeInfo.type === 'delete') {
      this.socket.emit('delete-file', { roomId: this.roomId, fileId });
      
      // Clean up Yjs binding if it exists and we're not in fallback mode
      if (!this.useFallbackMode && this.bindings && typeof this.bindings.has === 'function' && this.bindings.has(fileId)) {
        try {
          const binding = this.bindings.get(fileId);
          if (binding && typeof binding.destroy === 'function') {
            binding.destroy();
          }
          this.bindings.delete(fileId);
        } catch (e) {
          console.error('Error cleaning up binding:', e);
        }
      }
      
      return;
    }

    if (changeInfo.type === 'rename') {
      this.socket.emit('rename-file', { 
        roomId: this.roomId, 
        fileId, 
        newName: changeInfo.newName 
      });
      return;
    }

    if (changeInfo.type === 'new-file') {
      this.socket.emit('new-file', { 
        roomId: this.roomId, 
        file: { 
          id: fileId, 
          name: changeInfo.name, 
          language: changeInfo.language,
          value 
        } 
      });
      return;
    }

    // For normal text content changes
    // First, check if we can use Yjs and have a binding
    const hasBinding = !this.useFallbackMode && 
                      this.bindings && 
                      typeof this.bindings.has === 'function' && 
                      this.bindings.has(fileId);
                      
    // If we have a Yjs binding, the sync is already handled
    if (hasBinding) {
      // Yjs already handles synchronization
      return;
    }
    
    // Fall back to socket.io for all other cases
    this.socket.emit('file-change', { roomId: this.roomId, fileId, value });
  }

  // Set up Monaco editor binding with Yjs
  setupEditorBinding(fileId, editor) {
    // If we're in fallback mode, don't attempt to use Yjs
    if (this.useFallbackMode || !editor || !this.ydoc || !this.provider || !this.provider.awareness) {
      console.log('Using Socket.IO fallback for editor synchronization');
      return null;
    }
    
    try {
      // Clean up existing binding if any
      if (this.bindings && typeof this.bindings.has === 'function' && this.bindings.has(fileId)) {
        const binding = this.bindings.get(fileId);
        if (binding && typeof binding.destroy === 'function') {
          binding.destroy();
        }
        this.bindings.delete(fileId);
      }
      
      // Create a shared text for this file
      const ytext = this.ydoc.getText(`file-${fileId}`);
      
      // Create Monaco binding
      const binding = new MonacoBinding(
        ytext,
        editor.getModel(),
        new Set([editor]),
        this.provider.awareness
      );
      
      // Store the binding
      this.bindings.set(fileId, binding);
      
      // Set initial content if needed
      const currentValue = editor.getValue();
      if (currentValue && ytext.toString() === '') {
        // Only set initial content if the Yjs document is empty
        ytext.delete(0, ytext.length);
        ytext.insert(0, currentValue);
      }
      
      console.log(`Yjs binding set up successfully for file ${fileId}`);
      return binding;
    } catch (error) {
      console.error('Error setting up editor binding - falling back to Socket.IO:', error);
      this.useFallbackMode = true;
      return null;
    }
  }

  // Disconnect from server
  disconnect() {
    try {
      // Clean up all Yjs bindings
      if (this.bindings) {
        this.bindings.forEach((binding, fileId) => {
          try {
            if (binding && typeof binding.destroy === 'function') {
              binding.destroy();
            }
          } catch (e) {
            console.error(`Error destroying binding for file ${fileId}:`, e);
          }
        });
        this.bindings.clear();
      }
      
      // Disconnect WebRTC provider
      if (this.provider) {
        try {
          this.provider.destroy();
        } catch (e) {
          console.error('Error destroying WebRTC provider:', e);
        }
        this.provider = null;
      }
      
      // Disconnect Yjs document
      if (this.ydoc) {
        try {
          this.ydoc.destroy();
        } catch (e) {
          console.error('Error destroying Yjs document:', e);
        }
        this.ydoc = null;
      }
      
      // Disconnect socket
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    } catch (e) {
      console.error('Error during disconnect:', e);
    }
    
    this.isConnected = false;
    this.eventListeners = {};
    this.useFallbackMode = false;
  }

  // Emit socket event
  emit(event, data) {
    if (!this.socket) return;
    try {
      this.socket.emit(event, data);
    } catch (e) {
      console.error(`Error emitting event ${event}:`, e);
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService(); 