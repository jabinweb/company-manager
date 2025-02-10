import { cookies } from "next/headers";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const layout = cookieStore.get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  return (
    <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
  );
}