import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import useSocket from "../hooks/useSocket";
import RoomJoin from "../components/RoomJoin";
import type { ChatMessage } from "../types/chat";
import { verifyToken } from "../lib/apis/AuthApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();
  const socketRef = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const verifyUserLogin = async () => {
      const response = await verifyToken();
      if (response.status === 200 && response.loginStatus) {
        setUser(response.user.name);
      } else {
        toast.error("User is not logged In!!");
        navigate("/");
      }
    };
    verifyUserLogin();
  }, []);

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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">💬 Real-time Chat</h1>
      {!joined ? (
        <RoomJoin onJoin={joinRoom} />
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">Room: {room}</h2>
          <ChatBox messages={messages} />
          <MessageInput onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
