import { Server, Socket } from "socket.io";
import User from "../models/User.model.js";
import type { ConnectedUser } from "../types/Types.js";
import Group from "../models/Group.model.js";
import Message from "../models/Message.mode.js";

interface User {
  id: string;
  username: string;
  room: string;
}

let connectedUsers: ConnectedUser[] = [];

const chatSocket = (io: Server, socket: Socket) => {
  console.log(`Client Connected Successfully socketId ${socket.id}`);

  socket.on("chat:register", async ({ userId }) => {
    const thisUser = await User.findById(userId);

    if (!thisUser) {
      socket.emit("chat:error", { message: "User is not Registered" });
      return;
    }

    connectedUsers.push({ socketId: socket.id, userId });
    console.log(`User ${thisUser.name} registered with socket ${socket.id}`);
  });

  socket.on(
    "chat:create_group",
    async (data: {
      groupName: string;
      membersId: number[];
      leaderId: number;
    }) => {
      try {
        const uniqueMembers = Array.from(new Set(data.membersId));
        const createdGroup = await Group.create({
          name: data.groupName,
          members: uniqueMembers,
          leader: data.leaderId,
        });
        await createdGroup.save();
        socket.emit("chat:group_created", {
          message: `Group ${data.groupName} created Successfully`,
        });
      } catch (e: any) {
        socket.emit("chat:error", { message: e.message });
      }
    }
  );

  socket.on("chat:join_group", async ({ groupId, userId }) => {
    try {
      const fetchedGroup = await Group.findById(groupId).populate("members");
      if (!fetchedGroup) {
        socket.emit("chat:error", { message: "Group Not Found" });
        return;
      }

      const isMember = fetchedGroup.members.some(
        (memberId) => memberId.toString() === userId.toString()
      );
      if (!isMember) {
        fetchedGroup.members.push(userId);
        await fetchedGroup.save();
        socket.to(groupId.toString()).emit("chat:system", {
          user: "System",
          message: `🔔 ${userId} joined group ${fetchedGroup!.name}`,
        });
      }
      socket.join(groupId.toString());
    } catch (e: any) {
      socket.emit("chat:error", { message: "e.message" });
    }
  });

  socket.on("chat:message_group", async ({ groupId, userId, message }) => {
    const user = await User.findById(userId);
    if (!user) return;

    const newMsg = new Message({
      sender: user._id,
      group: groupId,
      content: message,
    });
    await newMsg.save();

    io.to(groupId.toString()).emit("chat:message", {
      user: user.name,
      message,
      createdAt: newMsg.createdAt,
    });
  });

  socket.on(
    "chat:private_message",
    async ({ toUserId, fromUserId, message }) => {
      const fromUser = await User.findById(fromUserId);

      if (!fromUser) return;
      const newMsg = new Message({
        sender: fromUser._id,
        recipient: toUserId,
        content: message,
      });
      await newMsg.save();

      const recipient = connectedUsers.find((u) => u.userId === toUserId);

      if (recipient) {
        io.to(recipient.socketId).emit("chat:private_message", {
          user: fromUser?.name || "Unknown",
          message,
          createdAt: newMsg.createdAt,
        });
      }
    }
  );

  socket.on("fetch_all_users", async ({ fetcher_user_id }) => {
    const all_users = await User.find();

    let users_to_return = all_users.filter((u) => u._id !== fetcher_user_id);

    socket.emit("all_user", { users: users_to_return });
  });

  socket.on("fetch_all_groups", async () => {
    const all_ugroups = await Group.find();

    socket.emit("all_groups", { groups: all_ugroups });
  });

  socket.on(
    "chat:fetch_history",
    async ({ type, groupId, userId, otherUserId }) => {
      let messages: any = [];

      if (type === "group") {
        messages = await Message.find({ group: groupId })
          .populate("sender", "name")
          .sort({ createdAt: 1 });
      } else if (type === "private") {
        messages = await Message.find({
          $or: [
            { sender: userId, recipient: otherUserId },
            { sender: otherUserId, recipient: userId },
          ],
        })
          .populate("sender", "name")
          .sort({ createdAt: 1 });
      }

      socket.emit("chat:history", messages);
    }
  );

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((u) => u.socketId !== socket.id);
    console.log(`${socket.id} Disconnected`);
  });
};

export default chatSocket;
