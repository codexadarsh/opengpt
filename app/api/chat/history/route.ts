import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/app/database/chat.model";
import jwt from "jsonwebtoken";

// ---- Types ----
interface JwtPayload {
  id: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
}

// ---- Auth Helper ----
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      return (decoded as JwtPayload).id;
    }

    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// ---- Utils ----
function generateTitle(title?: string, messages?: Message[]) {
  if (title) return title;

  const firstMessage = messages?.[0]?.content;
  if (!firstMessage) return "New Chat";

  return firstMessage.length > 50
    ? firstMessage.slice(0, 50) + "..."
    : firstMessage;
}

// ---- GET ----
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("chatId title messages updatedAt createdAt")
      .lean()
      .exec();

    const formattedChats = chats.map((chat: any) => ({
      id: chat.chatId,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: (chat.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      })),
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error("GET chats error:", error);
    return NextResponse.json(
      { message: "Failed to fetch chats" },
      { status: 500 },
    );
  }
}

// ---- POST ----
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { chatId, title, messages } = body;

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID is required" },
        { status: 400 },
      );
    }

    // Basic validation
    const safeMessages: Message[] = Array.isArray(messages)
      ? messages.filter(
          (m) =>
            m &&
            typeof m.id === "string" &&
            typeof m.role === "string" &&
            typeof m.content === "string",
        )
      : [];

    const chat = await Chat.findOneAndUpdate(
      { chatId, userId },
      {
        $set: {
          title: generateTitle(title, safeMessages),
          messages: safeMessages,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          chatId,
          userId,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    ).exec();

    return NextResponse.json({
      message: "Chat saved successfully",
      chat: {
        id: chat.chatId,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.error("POST chat error:", error);
    return NextResponse.json(
      { message: "Failed to save chat" },
      { status: 500 },
    );
  }
}

// ---- DELETE ----
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chatId = request.nextUrl.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const result = await Chat.findOneAndDelete({ chatId, userId }).exec();

    if (!result) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("DELETE chat error:", error);
    return NextResponse.json(
      { message: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
