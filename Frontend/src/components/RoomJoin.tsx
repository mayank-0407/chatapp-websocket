import { useState } from "react";

interface RoomJoinProps {
  onJoin: (room: string) => void;
}

const JoinRoom = ({ onJoin }: RoomJoinProps) => {
  const [room, setRoom] = useState("");

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name..."
        className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button
        onClick={() => room && onJoin(room)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;
