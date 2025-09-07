import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import chatSocket from "./sockets/chatSocket.js";
import mongoose from "mongoose";

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
const DB_URL: string | null = process.env.DB_URL!;

try {
  mongoose.connect(DB_URL, { dbName: "chatapp" });
  console.log("Database Connected");
} catch (e) {
  console.log("Unable to connect to DB" + e);
}
httpServer.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
