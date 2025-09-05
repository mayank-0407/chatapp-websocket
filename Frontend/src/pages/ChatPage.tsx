import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import useSocket from "../hooks/useSocket";
import RoomJoin from "../components/RoomJoin";
import type { ChatMessage } from "../types/chat";

export default function ChatPage() {
  const socketRef = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("chat:message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("chat:system", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("chat:message");
      socket.off("chat:system");
    };
  }, [socketRef]);

  const joinRoom = (roomName: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("chat:join", { room: roomName, user });
    setRoom(roomName);
    setJoined(true);
  };

  const sendMessage = (message: string) => {
    const socket = socketRef.current;
    if (!socket || !room) return;
    socket.emit("chat:message", { room, user, message });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>💬 Real-time Chat</h1>
      {!joined ? (
        <>
          <input
            type="text"
            name="name"
            placeholder="Enter the name of the user"
            onChange={(e) => setUser(e.target.value)}
          />
          <RoomJoin onJoin={joinRoom} />
        </>
      ) : (
        <>
          <h2>Room: {room}</h2>
          <ChatBox messages={messages} />
          <MessageInput onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
