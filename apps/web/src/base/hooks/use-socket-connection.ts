import { useEffect } from "react";
import { socketService } from "@/services/socketService";

export function useSocketConnection() {
  useEffect(() => {
    socketService().connect();

    socketService().onConnect(() => {
      console.log("✅ Socket connected");
    });

    socketService().onDisconnect(() => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socketService().disconnect();
    };
  }, []);
}
