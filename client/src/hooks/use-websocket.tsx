import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data?: any;
  buildingId?: string;
  timestamp?: string;
}

interface UseWebSocketProps {
  onElectricalDataUpdate?: (data: any) => void;
  onEnvironmentalDataUpdate?: (data: any) => void;
  onAlertUpdate?: (alert: any) => void;
}

export function useWebSocket({ 
  onElectricalDataUpdate, 
  onEnvironmentalDataUpdate, 
  onAlertUpdate 
}: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          switch (message.type) {
            case 'electrical_data_update':
              onElectricalDataUpdate?.(message.data);
              break;
            case 'environmental_data_update':
              onEnvironmentalDataUpdate?.(message.data);
              break;
            case 'alert_update':
              onAlertUpdate?.(message.data);
              break;
            case 'connection_established':
              console.log("WebSocket connection confirmed");
              break;
            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  const subscribeToBuilding = (buildingId: string) => {
    sendMessage({
      type: 'subscribe',
      buildingId: buildingId
    });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribeToBuilding
  };
}
