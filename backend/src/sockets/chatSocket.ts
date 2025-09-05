import { Server, Socket } from "socket.io";

interface User {
  id: string;
  username: string;
  room: string;
}

let users: User[] = [];

const chatSocket = (io: Server, socket: Socket) => {
  console.log(`Client Connected Successfully socketId ${socket.id}`);

  socket.on("chat:join", ({ room, user }) => {
    socket.join(room);

    users = users.filter((u) => u.id !== socket.id);

    users.push({ id: socket.id, username: user, room });

    console.log(`Joined Room : ${room}`);

    socket
      .to(room)
      .emit("chat:system", { user: "System", message: `🔔 ${user} joined!` });
  });

  socket.on(
    "chat:message",
    (data: { room: string; user: string; message: string }) => {
      console.log(
        `Message Recieved from room ${data.room} by user ${data.user} and the message is ${data.message}`
      );

      socket
        .to(data.room)
        .emit("chat:message", { user: data.user, message: data.message });
    }
  );

  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      const { username, room } = user;
      users = users.filter((u) => u.id !== socket.id);

      socket.to(room).emit("chat:system", {
        user: "System",
        message: `👋 ${username} left the room`,
      });
      console.log(`${username} left ${room}`);
    }
  });
};

export default chatSocket;
