import type { ChatMessage } from "../types/chat";

interface ChatBoxProps {
  messages: ChatMessage[];
}

export default function ChatBox({ messages }: ChatBoxProps) {
  console.log("MEssage", messages);
  return (
    <div className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto bg-white shadow-sm mb-4">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center">No messages yet...</p>
      ) : (
        messages.map((msg, idx) => (
          <p key={idx} className="mb-1">
            <span className="font-semibold text-blue-600">{msg.user}</span>:{" "}
            <span className="text-gray-700">{msg.message}</span>
          </p>
        ))
      )}
    </div>
  );
}
