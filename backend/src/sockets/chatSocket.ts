import { Server, Socket } from "socket.io";

const chatSocket = (io: Server, socket: Socket) => {
  console.log(`Client Connected Successfully socketId ${socket.id}`);

  socket.on("chat:join", (room: string) => {
    socket.join(room);
    console.log(`Joined Room : ${room}`);
    socket.to(room).emit("chat:message", {
      user: "System",
      message: `A new User Joined the room ${room}`,
    });
  });

  socket.on(
    "chat:message",
    (data: { room: string; user: string; message: string }) => {
      console.log(
        `Message Recieved from room ${data.room} by user ${data.user} and the message is ${data.message}`
      );

      io.to(data.room).emit("chat:message", { message: data.message });
    }
  );

  socket.on("disconnect", () => {
    console.log(`User Disconnected ${socket.id}`);
  });
};

export default chatSocket;
