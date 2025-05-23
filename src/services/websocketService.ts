import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// Define WebSocket status
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Define WebSocket message types
export type WebSocketMessageType =
    | 'notification'
    | 'update'
    | 'error'
    | 'ping'
    | 'privilege:change'
    | 'exam:mode_start'
    | 'exam:mode_status_change'
    | 'exam:access_granted'
    | 'exam:started'
    | 'exam:ended'
    | 'exam:warning'
    | 'exam:status_update'
    | 'exam:channel_join'
    | 'exam:channel_leave';

// Define WebSocket message structure
export interface WebSocketMessage {
    type: WebSocketMessageType;
    data: any;
    timestamp?: number;
}

// Define message handler type
export type MessageHandler = (message: WebSocketMessage) => void;

// WebSocket store interface
interface WebSocketStore {
    socket: Socket | null;
    status: WebSocketStatus;
    isConnecting: boolean;
    reconnectAttempts: number;
    hasConnectionIssue: boolean;
    connect: () => void;
    disconnect: () => void;
    reconnect: () => void;
    setStatus: (status: WebSocketStatus) => void;
    sendMessage: (type: WebSocketMessageType, data: any) => boolean;
    messageHandlers: Map<WebSocketMessageType, MessageHandler[]>;
    registerMessageHandler: (type: WebSocketMessageType, handler: MessageHandler) => () => void;
}

// Configuration
const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';  // Socket.IO URL (without /ws)
// Check if we need a specific namespace
const WS_NAMESPACE = import.meta.env.VITE_WS_NAMESPACE || '/'; // Default to root namespace if not specified
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000; // 2 seconds between attempts

// Toast ID for the WebSocket connection issue toast
const WS_CONNECTION_TOAST_ID = 'ws-connection-issue';

// Create WebSocket store using Zustand
export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
    socket: null,
    status: 'disconnected',
    isConnecting: false,
    reconnectAttempts: 0,
    hasConnectionIssue: false,
    messageHandlers: new Map(),

    // Set WebSocket status
    setStatus: (status: WebSocketStatus) => {
        set({ status });

        // Handle connection issues toast
        if (status === 'error' || status === 'reconnecting') {
            set({ hasConnectionIssue: true });
            toast.error(
                status === 'reconnecting'
                    ? 'Reconnecting to server...'
                    : 'Connection lost. Click to retry.',
                {
                    id: WS_CONNECTION_TOAST_ID,
                    duration: Infinity,
                }
            );
        } else if (status === 'connected' && get().hasConnectionIssue) {
            set({ hasConnectionIssue: false });
            toast.dismiss(WS_CONNECTION_TOAST_ID);
            toast.success('Connection restored!', { duration: 3000 });
        }
    },

    // Connect to Socket.IO
    connect: () => {
        // Get current state
        const { socket, isConnecting, setStatus } = get();
        const token = useAuthStore.getState().token;

        // If already connected or connecting, don't try to connect again
        if (socket || isConnecting) return;

        // Check if token exists
        if (!token) {
            console.error('Socket.IO connection failed: No authentication token available');
            return;
        }

        set({ isConnecting: true });
        setStatus('connecting');

        try {
            // Log connection attempt
            console.log(`Attempting Socket.IO connection to: ${WS_URL}${WS_NAMESPACE}`);

            // Create Socket.IO connection with auth token
            // Use the namespace when connecting
            const socketUrl = `${WS_URL}${WS_NAMESPACE === '/' ? '' : WS_NAMESPACE}`;
            console.log('Socket.IO connecting with URL:', socketUrl, 'and auth token:', token.substring(0, 10) + '...');

            const socketInstance = io(socketUrl, {
                auth: { token },
                reconnection: false, // We'll handle reconnection ourselves
                timeout: 10000, // 10s timeout
                transports: ['websocket'], // Force WebSocket transport
            });

            // Socket.IO event handlers
            socketInstance.on('connect', () => {
                set({
                    socket: socketInstance,
                    isConnecting: false,
                    reconnectAttempts: 0
                });
                setStatus('connected');
                console.log('Socket.IO connected successfully with ID:', socketInstance.id);
            });

            socketInstance.on('disconnect', (reason) => {
                set({ socket: null, isConnecting: false });

                if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                    // Server/client initiated the disconnect intentionally
                    setStatus('disconnected');
                } else {
                    // Unintentional disconnect
                    console.error('Socket.IO disconnected unexpectedly, reason:', reason);
                    setStatus('error');
                    // Auto-reconnect if not intentionally disconnected
                    setTimeout(() => get().reconnect(), RECONNECT_INTERVAL);
                }
                console.log('Socket.IO closed', reason);
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error.message);
                if (error.message.includes('namespace')) {
                    console.error('This is a namespace error. Your server may not be configured with this namespace:', WS_NAMESPACE);
                    console.error('Try connecting to the root namespace "/" or configure your server with this namespace');
                }
                setStatus('error');
                set({ socket: null, isConnecting: false });
                // Auto-reconnect on error
                setTimeout(() => get().reconnect(), RECONNECT_INTERVAL);
            });

            // Message handler - listen for all custom events
            [
                'notification',
                'update',
                'error',
                'ping',
                'privilege:change',
                'exam:mode_start',
                'exam:mode_status_change',
                'exam:access_granted',
                'exam:started',
                'exam:ended',
                'exam:warning',
                'exam:status_update',
                'exam:channel_join',
                'exam:channel_leave'
            ].forEach(eventType => {
                socketInstance.on(eventType, (data) => {
                    try {
                        const message: WebSocketMessage = {
                            type: eventType as WebSocketMessageType,
                            data,
                            timestamp: Date.now()
                        };
                        console.log('Socket.IO message received:', message);

                        // Process the message through registered handlers
                        const handlers = get().messageHandlers.get(message.type) || [];
                        handlers.forEach(handler => handler(message));
                    } catch (error) {
                        console.error('Error handling Socket.IO message:', error);
                    }
                });
            });

            set({ socket: socketInstance });
        } catch (error) {
            console.error('Failed to create Socket.IO connection:', error);
            set({ isConnecting: false });
            setStatus('error');
        }
    },

    // Disconnect from Socket.IO
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
            toast.dismiss(WS_CONNECTION_TOAST_ID);
        }
    },

    // Reconnect to Socket.IO
    reconnect: () => {
        const { socket, reconnectAttempts, disconnect, connect, setStatus } = get();

        // Close existing connection if any
        if (socket) {
            disconnect();
        }

        // Check if we've exceeded max reconnect attempts
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            setStatus('error');
            toast.error('Failed to connect to the server. Please refresh the page.', {
                id: WS_CONNECTION_TOAST_ID,
                duration: Infinity
            });
            return;
        }

        // Increment reconnect attempts and try to connect
        set({
            reconnectAttempts: reconnectAttempts + 1,
            isConnecting: true
        });
        setStatus('reconnecting');
        connect();
    },

    // Send message through Socket.IO
    sendMessage: (type: WebSocketMessageType, data: any) => {
        const { socket, status } = get();
        if (socket && status === 'connected') {
            // In Socket.IO, we emit an event with the type name and data
            socket.emit(type, data);
            return true;
        }
        return false;
    },

    // Register message handler
    registerMessageHandler: (type: WebSocketMessageType, handler: MessageHandler) => {
        const { messageHandlers } = get();
        const handlers = messageHandlers.get(type) || [];
        handlers.push(handler);
        messageHandlers.set(type, handlers);

        // Return unsubscribe function
        return () => {
            const { messageHandlers } = get();
            const handlers = messageHandlers.get(type) || [];
            messageHandlers.set(
                type,
                handlers.filter(h => h !== handler)
            );
        };
    }
}));

// Hook for components to use WebSocket functionality
export const useWebSocket = () => {
    const store = useWebSocketStore();
    return {
        status: store.status,
        connect: store.connect,
        disconnect: store.disconnect,
        reconnect: store.reconnect,
        sendMessage: store.sendMessage,
        registerMessageHandler: store.registerMessageHandler,
        hasConnectionIssue: store.hasConnectionIssue
    };
};

// Test function to debug Socket.IO connections
// Can be called from browser console: import('/src/services/websocketService.js').then(m => m.testSocketConnection())
export const testSocketConnection = (customNamespace?: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
        console.error('Cannot test: No authentication token available');
        return;
    }

    // Try to connect to different namespaces for testing
    const baseUrl = WS_URL;
    const namespace = customNamespace || WS_NAMESPACE;
    const socketUrl = `${baseUrl}${namespace === '/' ? '' : namespace}`;

    console.log(`Testing Socket.IO connection to: ${socketUrl}`);
    const socket = io(socketUrl, {
        auth: { token },
        timeout: 5000,
        transports: ['websocket']
    });

    // Setup handlers
    socket.on('connect', () => {
        console.log('✅ TEST CONNECTION SUCCESSFUL to', socketUrl);
        console.log('Socket ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ TEST CONNECTION FAILED to', socketUrl);
        console.error('Error:', error.message);
    });

    // Disconnect after 10 seconds
    setTimeout(() => {
        if (socket.connected) {
            console.log('Disconnecting test connection');
            socket.disconnect();
        }
    }, 10000);

    return socket;
}; 