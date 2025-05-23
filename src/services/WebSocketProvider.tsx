import { useEffect, ReactNode, useCallback } from 'react';
import { useWebSocketStore } from './websocketService';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../global/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

// Component props
interface WebSocketProviderProps extends PropsWithChildren {}

// WebSocket provider component
const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  // Get WebSocket methods and state
  const { connect, disconnect, status, registerMessageHandler } = useWebSocketStore();
  const { refreshPrivileges } = useAuth();
  const queryClient = useQueryClient();

  // Get auth state
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isTokenExpired = useAuthStore(state => state.isTokenExpired);
  
  // Create a memoized connection handler
  const handleConnection = useCallback(() => {
    if (isAuthenticated() && !isTokenExpired()) {
      console.log('Auth conditions met, attempting WebSocket connection');
      connect();
    } else {
      console.log('Auth conditions not met, disconnecting WebSocket', {
        isAuthenticated: isAuthenticated(),
        isTokenExpired: isTokenExpired()
      });
      disconnect();
    }
  }, [connect, disconnect, isAuthenticated, isTokenExpired]);

  // Connect to WebSocket when the component mounts and auth state changes
  useEffect(() => {
    handleConnection();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [handleConnection, disconnect]);

  // Set up window focus/blur event listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When the page becomes visible and user is authenticated
        if (isAuthenticated() && !isTokenExpired() && status !== 'connected') {
          console.log('Page became visible, reconnecting WebSocket');
          connect();
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, isAuthenticated, isTokenExpired, connect]);

  // Register WebSocket message handlers
  useEffect(() => {
    const handlePrivilegeChange = async (message: any) => {
      console.log('Received privilege:change event:', message);
      await refreshPrivileges();
      console.log('User privileges refreshed due to WebSocket event.');
    };

    let unsubscribePrivilegeChange: (() => void) | undefined;

    if (status === 'connected') {
      unsubscribePrivilegeChange = registerMessageHandler('privilege:change', handlePrivilegeChange);
      console.log('Registered handler for privilege:change events.');
    }

    return () => {
      if (unsubscribePrivilegeChange) {
        unsubscribePrivilegeChange();
        console.log('Unregistered handler for privilege:change events.');
      }
    };
  }, [status, registerMessageHandler, refreshPrivileges]);

  // Return the children
  return <>{children}</>;
};

export default WebSocketProvider; 