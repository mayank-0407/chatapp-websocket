import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter group name"],
    unique: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

const Group = mongoose.model("group", GroupSchema);
export default Group;
