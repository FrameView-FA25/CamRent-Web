import React, { useState } from "react";
import { ChatList } from "../../components/Chat/ChatList";
import { ChatInterface } from "../../components/Chat/ChatInterface";

export const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // Mock data
  const mockChats = [
    {
      id: "1",
      recipientId: "owner1",
      recipientName: "Nguyễn Văn A",
      recipientRole: "owner" as const,
      lastMessage: "Camera vẫn còn không?",
      timestamp: new Date(),
      unreadCount: 2,
    },
    {
      id: "2",
      recipientId: "expert1",
      recipientName: "Chuyên gia Phạm B",
      recipientRole: "expert" as const,
      lastMessage: "Tôi sẽ tư vấn cho bạn về camera này",
      timestamp: new Date(Date.now() - 86400000),
      unreadCount: 0,
    },
  ];

  return (
    <div className="flex h-screen">
      <div
        className={`${
          selectedChat ? "hidden md:block" : "block"
        } w-full md:w-96 border-r border-gray-200`}
      >
        <ChatList chats={mockChats} onSelectChat={setSelectedChat} />
      </div>
      <div className={`${selectedChat ? "block" : "hidden md:block"} flex-1`}>
        {selectedChat ? (
          <ChatInterface
            recipientId={selectedChat.recipientId}
            recipientName={selectedChat.recipientName}
            recipientRole={selectedChat.recipientRole}
            currentUserId="currentUser"
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};
