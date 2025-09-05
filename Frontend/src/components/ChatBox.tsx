import type { ChatMessage } from "../types/chat";

interface ChatBoxProps {
  messages: ChatMessage[];
}

export default function ChatBox({ messages }: ChatBoxProps) {
  console.log(messages);
  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "10px",
        height: "200px",
        overflowY: "auto",
      }}
    >
      {messages.map((msg, idx) => (
        <p key={idx}>
          <b>{msg.user}</b>: {msg.message}
        </p>
      ))}
    </div>
  );
}
