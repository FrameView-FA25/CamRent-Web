import React from "react";
import { MessageCircle } from "lucide-react";

interface ChatPreview {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: "owner" | "expert";
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

interface ChatListProps {
  chats: ChatPreview[];
  onSelectChat: (chat: ChatPreview) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  return (
    <div className="bg-white h-screen">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900">Tin nhắn</h2>
      </div>

      <div className="overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MessageCircle size={48} className="mb-4" />
            <p>Chưa có tin nhắn nào</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {chat.recipientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.recipientName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {chat.timestamp.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
