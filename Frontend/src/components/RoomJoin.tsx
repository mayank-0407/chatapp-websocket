import { useEffect, useState } from "react";
import type { UserData } from "../types/auth";
import type { Group } from "../types/chat";
import Select from "react-select";

interface Props {
  currentUserId: string;
  allUsers: UserData[];
  allGroups: Group[];
  onCreateGroup: (name: string, memberIds: number[]) => void;
  onJoinGroup: (groupId: string) => void;
  onPrivateChat: (otherUserId: string) => void;
}

const JoinRoom = ({
  currentUserId,
  allUsers,
  allGroups,
  onCreateGroup,
  onJoinGroup,
  onPrivateChat,
}: Props) => {
  // Create group state
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Join group state
  const [joinGroupId, setJoinGroupId] = useState("");

  // Private chat state
  const [dmUserId, setDmUserId] = useState("");

  const handleCreateGroup = () => {
    let members = [...selectedMembers];

    // ensure creator is included
    if (currentUserId && !members.includes(Number(currentUserId))) {
      members.push(Number(currentUserId));
    }

    if (!groupName.trim()) return;
    onCreateGroup(groupName.trim(), members);
  };

  const options = allUsers
    .filter((u) => u._id.toString() !== currentUserId)
    .map((u) => ({ value: u._id, label: u.name }));

  useEffect(() => {
    console.log("huh", allUsers);
    console.log("huh1", allGroups);
  });
  return (
    <div className="space-y-6">
      {/* Create Group */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Create Group</h3>

        {/* Group name */}
        <div className="flex gap-2 mb-2">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="flex-1 border rounded-md p-2"
          />
        </div>

        {/* Members dropdown */}
        <label className="block mb-1 font-medium">Select Members</label>
        <Select
          options={options}
          isMulti
          value={options.filter((o) => selectedMembers.includes(o.value))}
          onChange={(selected) =>
            setSelectedMembers(selected ? selected.map((s) => s.value) : [])
          }
        />

        <button
          onClick={handleCreateGroup}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create Group
        </button>
      </div>

      {/* Join Existing Group */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Join Existing Group</h3>
        <div className="flex gap-2">
          <select
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            className="flex-1 border rounded-md p-2"
          >
            <option value="">Select a group...</option>
            {Array.isArray(allGroups) &&
              allGroups
                .filter((g) => !g.members.includes(Number(currentUserId))) // exclude groups user is already in
                .map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
          </select>
          <button
            onClick={() => joinGroupId && onJoinGroup(joinGroupId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Join Group
          </button>
        </div>
      </div>

      {/* Start Private Chat */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Start Private Chat</h3>
        <div className="flex gap-2">
          <select
            value={dmUserId}
            onChange={(e) => setDmUserId(e.target.value)}
            className="flex-1 border rounded-md p-2"
          >
            <option value="">Select a user...</option>
            {Array.isArray(allUsers) &&
              allUsers
                .filter((u) => u._id.toString() !== currentUserId)
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
          </select>
          <button
            onClick={() => dmUserId && onPrivateChat(dmUserId)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Start DM
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
