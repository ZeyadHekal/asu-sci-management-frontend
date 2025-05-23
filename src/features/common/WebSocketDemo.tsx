import { useState, useEffect } from 'react';
import { useWebSocket, WebSocketMessage, WebSocketMessageType } from '../../services/websocketService';

const WebSocketDemo = () => {
  const { status, sendMessage, registerMessageHandler } = useWebSocket();
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [messageText, setMessageText] = useState('');

  // Register message handlers
  useEffect(() => {
    // Handler for notification messages
    const notificationHandler = (message: WebSocketMessage) => {
      setMessages(prev => [...prev, message]);
    };

    // Register handlers for different message types
    const unsubscribeNotification = registerMessageHandler('notification', notificationHandler);
    const unsubscribeUpdate = registerMessageHandler('update', notificationHandler);
    const unsubscribeError = registerMessageHandler('error', notificationHandler);

    // Clean up handlers on component unmount
    return () => {
      unsubscribeNotification();
      unsubscribeUpdate();
      unsubscribeError();
    };
  }, [registerMessageHandler]);

  // Send a message
  const handleSendMessage = (type: WebSocketMessageType) => {
    if (messageText.trim() === '') return;
    
    const success = sendMessage(type, { text: messageText });
    
    if (success) {
      setMessageText('');
    } else {
      alert('Failed to send message. WebSocket not connected.');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">WebSocket Demo</h3>
      
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          status === 'connected' 
            ? 'bg-green-100 text-green-800' 
            : status === 'connecting' || status === 'reconnecting'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            status === 'connected' 
              ? 'bg-green-500' 
              : status === 'connecting' || status === 'reconnecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}></span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter message"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={status !== 'connected'}
          />
          <button
            onClick={() => handleSendMessage('notification')}
            disabled={status !== 'connected' || !messageText.trim()}
            className="bg-primary text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b px-3 py-2 text-sm font-medium">
          Messages
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm p-2 text-center">No messages yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg, index) => (
                <div key={index} className="text-sm border rounded-md p-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{msg.type}</span>
                    <span>
                      {msg.timestamp 
                        ? new Date(msg.timestamp).toLocaleTimeString() 
                        : 'Unknown time'}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    {typeof msg.data === 'object' 
                      ? JSON.stringify(msg.data) 
                      : String(msg.data)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketDemo; 