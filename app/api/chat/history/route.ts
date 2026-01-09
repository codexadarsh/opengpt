import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/app/database/chat.model";
import jwt from "jsonwebtoken";

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };
    return decoded.id;
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return null;
  }
}

// GET - Fetch all chats for the current user
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
      .lean();

    // Transform to match frontend format
    const formattedChats = chats.map((chat) => ({
      id: chat.chatId,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      })),
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { message: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// POST - Create a new chat or update existing
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { chatId, title, messages } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Upsert - create if doesn't exist, update if exists
    const chat = await Chat.findOneAndUpdate(
      { chatId, userId },
      {
        $set: {
          title:
            title ||
            (messages?.[0]?.content?.slice(0, 50) +
              (messages?.[0]?.content?.length > 50 ? "..." : "")) ||
            "New Chat",
          messages: messages || [],
          updatedAt: new Date(),
        },
        $setOnInsert: {
          chatId,
          userId,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

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
  } catch (error: any) {
    console.error("Error saving chat:", error);
    return NextResponse.json(
      { message: "Failed to save chat" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { message: "Chat ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Chat.findOneAndDelete({ chatId, userId });

    if (!result) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { message: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
