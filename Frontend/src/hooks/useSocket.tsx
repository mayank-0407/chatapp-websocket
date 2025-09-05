import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("ws://localhost:8000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  return socketRef;
};
export default useSocket;
