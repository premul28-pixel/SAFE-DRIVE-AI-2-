import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveLocations, setLiveLocations] = useState({});
  const [latestAlert, setLatestAlert] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket.IO connected to SafeDrive AI Backend');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('vehicleLocationUpdated', (data) => {
      setLiveLocations(prev => ({
        ...prev,
        [data.vehicleId]: data
      }));
    });

    newSocket.on('alcoholDetected', (alert) => {
      setLatestAlert(alert);
    });

    newSocket.on('sosTriggered', (alert) => {
      setLatestAlert(alert);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, liveLocations, latestAlert, setLatestAlert }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
