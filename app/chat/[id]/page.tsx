"use client";

import { ChatPage } from "../page";
import { useParams } from "next/navigation";

export default function ChatByIdPage() {
  const params = useParams();
  const chatId = params.id as string;

  return <ChatPage chatId={chatId} />;
}
