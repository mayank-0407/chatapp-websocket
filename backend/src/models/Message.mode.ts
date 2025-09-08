import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null, // if it's a private message
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
      default: null, // if it's a group message
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", MessageSchema);
export default Message;
