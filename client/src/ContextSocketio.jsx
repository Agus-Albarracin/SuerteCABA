  // src/ContextSocketio.js
  import React, { createContext, useContext, useEffect, useState } from 'react';
  import io from 'socket.io-client';
  import { useBalance } from './ContextBalance';

  const SocketContext = createContext();

  export const SocketProvider = ({ children }) => {
    const { setBalance } = useBalance(); 
    const [socket, setSocket] = useState(null);

    useEffect(() => {
      const socketIo = io('https://skarybet.com', {
      // const socketIo = io('http://localhost:3000', {
          transports: ['websocket'],
          // secure: true,
          rejectUnauthorized: false,
      }); 
  
      setSocket(socketIo);
  
      socketIo.on('connect', () => {
          console.log('Socket connected');
      });
  
      socketIo.on('disconnect', () => {
          console.log('Socket disconnected');
      });
  
      // Manejo de errores de conexión
      socketIo.on('connect_error', (error) => {
          console.log('Connection Error:', error);
      });
  
      return () => {
          socketIo.disconnect();
      };
  }, [setBalance]);

    return (
      <SocketContext.Provider value={{ socket }}>
        {children}
      </SocketContext.Provider>
    );
  };

  export const useSocket = () => useContext(SocketContext);
