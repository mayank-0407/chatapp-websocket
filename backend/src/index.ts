import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import chatSocket from "./sockets/chatSocket.js";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  chatSocket(io, socket);
});

const PORT = process.env.PORT;

httpServer.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
