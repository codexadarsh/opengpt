import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/app/database/chat.model";
import jwt from "jsonwebtoken";

// Helper to get user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET - Fetch a single chat by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: chatId } = await params;

    await connectDB();

    const chat = await Chat.findOne({ chatId, userId }).lean();

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      chat: {
        id: chat.chatId,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { message: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}
