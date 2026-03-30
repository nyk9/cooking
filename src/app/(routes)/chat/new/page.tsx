import { ChatInterface } from "@/components/features/chat-interface";

export default function NewChatPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">新しい会話</h1>
      <ChatInterface />
    </div>
  );
}
