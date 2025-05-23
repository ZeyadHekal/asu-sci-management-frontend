import { useEffect, useState } from 'react';
import { useWebSocket, WebSocketStatus } from '../../services/websocketService';
import { FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

const WebSocketStatusIndicator = () => {
  const { status, reconnect, hasConnectionIssue } = useWebSocket();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show indicator when there's a connection issue
    if (hasConnectionIssue) {
      setVisible(true);
    } else {
      // Hide indicator after 3 seconds when connection is restored
      if (status === 'connected') {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [status, hasConnectionIssue]);
  
  // Don't render anything if there's no connection issue and not visible
  if (!visible) {
    return null;
  }
  
  const getStatusColor = (status: WebSocketStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'error':
      default:
        return 'bg-red-500';
    }
  };
  
  const getStatusIcon = (status: WebSocketStatus) => {
    switch (status) {
      case 'connected':
        return <FiWifi className="animate-pulse" />;
      case 'connecting':
      case 'reconnecting':
        return <FiRefreshCw className="animate-spin" />;
      case 'disconnected':
      case 'error':
      default:
        return <FiWifiOff />;
    }
  };
  
  const getStatusText = (status: WebSocketStatus) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
      default:
        return 'Connection Error';
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-white ${getStatusColor(status)}`}>
        <span className="text-lg">
          {getStatusIcon(status)}
        </span>
        <span className="font-medium">{getStatusText(status)}</span>
        
        {(status === 'disconnected' || status === 'error') && (
          <button 
            onClick={reconnect}
            className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Reconnect"
          >
            <FiRefreshCw />
          </button>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatusIndicator; 