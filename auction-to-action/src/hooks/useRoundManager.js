import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import axios from 'axios';
import { socketServerUrl } from '../servercon';

/**
 * Custom hook for managing round state with real-time updates
 * Connects to database through socket service for multi-computer sync
 */
export const useRoundManager = () => {
  const [currentRound, setCurrentRound] = useState({
    roundNumber: 0,
    roundStatus: 'not_started',
    timestamp: new Date().toISOString()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current round state from database
  const fetchCurrentRound = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${socketServerUrl}/api/round/current`);
      if (response.data.success) {
        setCurrentRound(response.data.roundData);
        console.log('🎯 Round state fetched from database:', response.data.roundData);
      }
    } catch (err) {
      console.error('❌ Error fetching current round:', err);
      setError('Failed to fetch current round state');
    }
  }, []);

  // Handle real-time round updates
  const handleRoundUpdate = useCallback((roundData) => {
    console.log('🔄 Real-time round update received:', roundData);
    setCurrentRound(roundData);
  }, []);

  // Connect to socket and set up listeners
  useEffect(() => {
    try {
      // Connect to socket service
      socketService.connect();
      
      // Set up round update listener
      socketService.onRoundUpdate(handleRoundUpdate);
      
      // Track connection status
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('connect', () => {
          setIsConnected(true);
          console.log('🔌 Round manager connected to socket');
          // Fetch initial state when connected
          fetchCurrentRound();
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          console.log('🔌 Round manager disconnected from socket');
        });
      }

      // Fetch initial round state
      fetchCurrentRound();

    } catch (err) {
      console.error('❌ Error setting up round manager:', err);
      setError('Failed to connect to real-time updates');
    }

    // Cleanup on unmount
    return () => {
      if (socketService.getSocket()) {
        socketService.removeListener('roundUpdated', handleRoundUpdate);
      }
    };
  }, [handleRoundUpdate, fetchCurrentRound]);

  // Convert round data to game state (0-6 format for existing components)
  const getGameState = useCallback(() => {
    const { roundNumber, roundStatus } = currentRound;
    
    if (roundNumber === 0 || !roundNumber || roundStatus === 'not_started') {
      return 0; // Not yet started
    } else if (roundNumber === 1) {
      return roundStatus === 'ongoing' ? 1 : 2; // Round 1 ongoing or ended
    } else if (roundNumber === 2) {
      return roundStatus === 'ongoing' ? 3 : 4; // Round 2 ongoing or ended  
    } else if (roundNumber === 3) {
      return roundStatus === 'ongoing' ? 5 : 6; // Round 3 ongoing or ended
    }
    return 0;
  }, [currentRound]);

  return {
    currentRound,
    gameState: getGameState(),
    isConnected,
    error,
    fetchCurrentRound,
    // Expose socket service methods for advanced usage
    socket: socketService.getSocket()
  };
};