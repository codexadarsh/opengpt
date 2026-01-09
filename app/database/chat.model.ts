import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  chatId: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      maxlength: 100,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for efficient user-specific queries
chatSchema.index({ userId: 1, updatedAt: -1 });

const Chat: Model<IChat> =
  mongoose.models.chats || mongoose.model<IChat>("chats", chatSchema);

export default Chat;
