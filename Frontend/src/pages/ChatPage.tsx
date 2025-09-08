import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";
import useSocket from "../hooks/useSocket";
import { verifyToken } from "../lib/apis/AuthApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { ChatMessage, Group } from "../types/chat";
import JoinRoom from "../components/RoomJoin";
import type { UserData } from "../types/auth";

type Mode = "none" | "group" | "private";

export default function ChatPage() {
  const navigate = useNavigate();
  const socketRef = useSocket();

  const [mode, setMode] = useState<Mode>("none");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  const [allUser, setAllUsers] = useState<UserData[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  // context ids
  const [groupId, setGroupId] = useState<string>("");
  const [otherUserId, setOtherUserId] = useState<string>("");

  // 1) Verify user + register socket
  useEffect(() => {
    const run = async () => {
      const res = await verifyToken();
      if (res.status === 200 && res.loginStatus) {
        const u = { id: res.user._id, name: res.user.name };
        setUser(u);
        console.log(u);
        const socket = socketRef.current;
        if (socket) socket.emit("chat:register", { userId: u.id });
      } else {
        toast.error("User is not logged in!");
        navigate("/");
      }
    };
    run();
  }, []);

  // 2) Socket listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // incoming group messages
    socket.on("chat:message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    // incoming private messages
    socket.on("chat:private_message", (data: ChatMessage) => {
      console.log("HI", data);
      setMessages((prev) => [...prev, data]);
    });

    // system messages
    socket.on("chat:system", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.emit("fetch_all_users", { fetcher_user_id: user?.id });
    socket.emit("fetch_all_groups");

    socket.on("all_user", (data: { users: UserData[] }) => {
      // console.log("data");
      // console.log(data);
      setAllUsers(data.users);
    });
    socket.on("all_groups", (data: { groups: Group[] }) => {
      // console.log("data");
      // console.log(data);
      setAllGroups(data.groups);
    });

    // history from DB
    socket.on("chat:history", (msgs: any[]) => {
      const formatted: ChatMessage[] = msgs.map((m) => ({
        user: m.sender?.name || "Unknown",
        message: m.content,
        createdAt: m.createdAt,
      }));
      console.log("aksjdasd", formatted);
      setMessages(formatted);
    });

    // group created ACK
    socket.on("chat:group_created", (group: any) => {
      toast.success(`Group "${group.name}" created`);
      if (!user) return;

      // auto-join the new group then fetch history
      socket.emit("chat:join_group", { groupId: group._id, userId: user.id });
      socket.emit("chat:fetch_history", {
        type: "group",
        groupId: group._id,
        userId: user.id,
      });

      setMode("group");
      setGroupId(group._id);
      setOtherUserId("");
      setMessages([]); // reset view
    });

    // backend errors
    socket.on("chat:error", (err: { message: string }) => {
      toast.error(err.message || "Something went wrong");
    });

    return () => {
      socket.off("chat:message");
      socket.off("chat:private_message");
      socket.off("chat:system");
      socket.off("chat:history");
      socket.off("chat:group_created");
      socket.off("chat:error");
      socket.off("all_users");
    };
  }, [socketRef, user]);

  // 3) Handlers

  // Create a group (will trigger chat:group_created → auto-join)
  const handleCreateGroup = (name: string, memberIds: number[]) => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    // ensure creator is in the members
    const uniqueMembers = Array.from(
      new Set([...memberIds.filter(Boolean), user.id])
    );

    socket.emit("chat:create_group", {
      groupName: name,
      memberIds: uniqueMembers,
    });
  };

  // Join an existing group by id
  const handleJoinGroup = (gid: string) => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    setMode("group");
    setGroupId(gid);
    setOtherUserId("");
    setMessages([]); // clear old context

    socket.emit("chat:join_group", { groupId: gid, userId: user.id });
    socket.emit("chat:fetch_history", {
      type: "group",
      groupId: gid,
      userId: user.id,
    });
  };

  // Start a direct (private) chat
  const handleStartPrivate = (targetUserId: string) => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    setMode("private");
    setOtherUserId(targetUserId);
    setGroupId("");
    setMessages([]);

    socket.emit("chat:fetch_history", {
      type: "private",
      userId: user.id,
      otherUserId: targetUserId,
    });
  };

  // Send message (group or private)
  const sendMessage = (message: string) => {
    const socket = socketRef.current;
    if (!socket || !user) return;
    if (!message.trim()) return;

    if (mode === "group" && groupId) {
      socket.emit("chat:message_group", {
        groupId,
        userId: user.id,
        message,
      });
    } else if (mode === "private" && otherUserId) {
      socket.emit("chat:private_message", {
        fromUserId: user.id,
        toUserId: otherUserId,
        message,
      });
    } else {
      return;
    }

    // optimistic UI
    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     user: user.name,
    //     message,
    //     createdAt: new Date().toISOString(),
    //   },
    // ]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">💬 Real-time Chat</h1>

      {mode === "none" ? (
        <JoinRoom
          currentUserId={user?.id || ""}
          allUsers={allUser}
          allGroups={allGroups}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinGroup}
          onPrivateChat={handleStartPrivate}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">
              {mode === "group"
                ? `Group: ${groupId}`
                : `Private chat with: ${otherUserId}`}
            </h2>
            <button
              onClick={() => {
                setMode("none");
                setMessages([]);
                setGroupId("");
                setOtherUserId("");
              }}
              className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>

          <ChatBox messages={messages} />
          <MessageInput onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
