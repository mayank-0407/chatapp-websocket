import { useState } from "react";

interface RoomJoinProps {
  onJoin: (room: string) => void;
}

const JoinRoom = ({ onJoin }: RoomJoinProps) => {
  const [room, setRoom] = useState("");

  return <div>
      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name..."
        style={{ marginRight: "10px" }}
      />
      <button onClick={() => room && onJoin(room)}>Join Room</button>
    </div>;
};

export default JoinRoom;
