import serverUrl from './../servercon';
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(url = serverUrl) {
    if (!this.socket) {
      this.socket = io(url, {
        autoConnect: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    }

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a team room for targeted updates
  joinTeam(teamNumber) {
    if (this.socket) {
      this.socket.emit('joinTeam', teamNumber);
      console.log(`🏠 Joined team room: ${teamNumber}`);
    }
  }

  // Leave a team room
  leaveTeam(teamNumber) {
    if (this.socket) {
      this.socket.emit('leaveTeam', teamNumber);
      console.log(`🚪 Left team room: ${teamNumber}`);
    }
  }

  // Listen for team updates
  onTeamUpdate(callback) {
    if (this.socket) {
      this.socket.on('teamUpdated', callback);
    }
  }

  // Listen for round updates
  onRoundUpdate(callback) {
    if (this.socket) {
      this.socket.on('roundUpdated', callback);
    }
  }

  // Listen for database updates
  onDatabaseUpdate(callback) {
    if (this.socket) {
      this.socket.on('databaseUpdate', callback);
    }
  }

  // Remove listeners
  removeListener(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(eventName) {
    if (this.socket) {
      this.socket.removeAllListeners(eventName);
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
