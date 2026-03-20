import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { MessageCircle, X, ArrowLeft, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerChatOpener } from "@/lib/chat";

type OtherUser = {
  id: string;
  name: string | null;
  handle: string | null;
  image: string | null;
};

type Conversation = {
  id: string;
  otherUser: OtherUser;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    read: boolean;
    createdAt: Date;
  } | null;
  unreadCount: number;
  updatedAt: Date;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  sender: OtherUser;
};

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [newMsgUserId, setNewMsgUserId] = useState("");
  const [newMsgUserName, setNewMsgUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Poll unread count every 30s
  const { data: unreadData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => client.getUnreadCount(),
    refetchInterval: 30000,
    retry: false,
  });

  const unreadCount = unreadData?.count ?? 0;

  // Get conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => client.getConversations(),
    enabled: isOpen,
    refetchInterval: isOpen ? 15000 : false,
    retry: false,
  });

  // Get messages for active conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeConvo?.id],
    queryFn: () => client.getMessages(activeConvo!.id),
    enabled: !!activeConvo,
    refetchInterval: activeConvo ? 10000 : false,
    retry: false,
  });

  // Mark messages read when opening a conversation
  const markReadMutation = useMutation({
    mutationFn: (convoId: string) => client.markMessagesRead(convoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ convoId, content }: { convoId: string; content: string }) =>
      client.sendMessage(convoId, content),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({
        queryKey: ["messages", activeConvo?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Create conversation mutation
  const createConvoMutation = useMutation({
    mutationFn: (userId: string) => client.getOrCreateConversation(userId),
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowNewMsg(false);
      setNewMsgUserId("");
      setNewMsgUserName("");
      // Build a Conversation object from the result
      const raw = convo as unknown as {
        id: string;
        participant1: string;
        participant2: string;
        user1: OtherUser;
        user2: OtherUser;
        updatedAt: Date;
      };
      // Figure out which user is "other"
      // We'll just open it - the conversations list will refresh
      setIsOpen(true);
      // Find by ID in refetched list or build manually
      const newConvo: Conversation = {
        id: raw.id,
        otherUser: raw.user2, // will be corrected on next refresh
        lastMessage: null,
        unreadCount: 0,
        updatedAt: raw.updatedAt,
      };
      setActiveConvo(newConvo);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Register global opener
  const openChatHandler = useCallback(
    (userId: string) => {
      setIsOpen(true);
      createConvoMutation.mutate(userId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    return registerChatOpener(openChatHandler);
  }, [openChatHandler]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark read when opening convo
  useEffect(() => {
    if (activeConvo) {
      markReadMutation.mutate(activeConvo.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?.id]);

  const handleSend = () => {
    if (!activeConvo || !newMessage.trim()) return;
    sendMutation.mutate({ convoId: activeConvo.id, content: newMessage.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function getDisplayName(user: OtherUser | null) {
    if (!user) return "Unknown";
    return user.name ?? user.handle ?? "User";
  }

  function getInitials(user: OtherUser | null) {
    const name = getDisplayName(user);
    return name.charAt(0).toUpperCase();
  }

  function formatTime(date: Date | string) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? formatTime(d) : d.toLocaleDateString();
  }

  // We need to figure out current user's ID from messages
  const sentMessages = (messages as Message[]).filter(
    (m) => activeConvo && m.senderId !== activeConvo.otherUser.id,
  );
  const myUserId = sentMessages.length > 0 ? sentMessages[0].senderId : null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/80 border-b border-white/10">
            {activeConvo ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveConvo(null)}
                    className="text-zinc-400 hover:text-white p-1 rounded"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(activeConvo.otherUser)}
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {getDisplayName(activeConvo.otherUser)}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="text-white font-bold text-sm">Messages</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewMsg(true)}
                    className="text-zinc-400 hover:text-emerald-400 p-1 rounded"
                    title="New message"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Body */}
          {showNewMsg ? (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-zinc-400 text-xs">
                Enter the User ID to start a conversation
              </p>
              <Input
                value={newMsgUserId}
                onChange={(e) => setNewMsgUserId(e.target.value)}
                placeholder="User ID"
                className="bg-zinc-800 border-white/10 text-white text-sm"
              />
              <Input
                value={newMsgUserName}
                onChange={(e) => setNewMsgUserName(e.target.value)}
                placeholder="Their name (optional)"
                className="bg-zinc-800 border-white/10 text-white text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewMsg(false)}
                  className="border-white/10 text-zinc-300 hover:text-white flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (newMsgUserId.trim()) {
                      createConvoMutation.mutate(newMsgUserId.trim());
                    }
                  }}
                  disabled={!newMsgUserId.trim() || createConvoMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex-1"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          ) : activeConvo ? (
            <>
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {(messages as Message[]).length === 0 && (
                  <div className="text-center text-zinc-500 text-xs pt-8">
                    No messages yet. Say hello!
                  </div>
                )}
                {(messages as Message[]).map((msg) => {
                  const isMine = myUserId
                    ? msg.senderId === myUserId
                    : msg.senderId !== activeConvo.otherUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-zinc-700 text-white rounded-bl-sm"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${isMine ? "text-emerald-200" : "text-zinc-400"}`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/10 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  className="bg-zinc-800 border-white/10 text-white text-sm flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black w-9 h-9 flex-shrink-0"
                >
                  <Send size={14} />
                </Button>
              </div>
            </>
          ) : (
            /* Conversations list */
            <div className="flex-1 overflow-y-auto">
              {(conversations as Conversation[]).length === 0 ? (
                <div className="text-center text-zinc-500 text-xs pt-12 px-6">
                  <MessageCircle
                    size={28}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p>No conversations yet.</p>
                  <button
                    onClick={() => setShowNewMsg(true)}
                    className="text-emerald-400 text-xs mt-2 hover:underline"
                  >
                    Start one →
                  </button>
                </div>
              ) : (
                (conversations as Conversation[]).map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setActiveConvo(convo)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors border-b border-white/5 text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {getInitials(convo.otherUser)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium truncate">
                          {getDisplayName(convo.otherUser)}
                        </span>
                        <span className="text-zinc-500 text-[10px] flex-shrink-0 ml-2">
                          {formatDate(convo.updatedAt)}
                        </span>
                      </div>
                      {convo.lastMessage && (
                        <p className="text-zinc-400 text-xs truncate mt-0.5">
                          {convo.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {convo.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {convo.unreadCount}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActiveConvo(null);
        }}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-lg flex items-center justify-center transition-all active:scale-95 relative"
      >
        {isOpen ? (
          <X size={22} className="text-black" />
        ) : (
          <MessageCircle size={22} className="text-black" />
        )}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>
    </div>
  );
}
