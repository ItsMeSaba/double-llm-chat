import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { getUserMessages } from "@/services/messages/get-user-messages";
import { createFeedback } from "@/services/feedback/create-feedback";
import { scrollIntoView } from "@/base/utils/scroll-into-view";
import { socketService } from "@/services/socketService";
import { ChatWindow } from "./components/ChatWindow";
import { ChatHeader } from "./components/ChatHeader";
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./components/ChatInput";
import { to } from "@/base/utils/to";
import "./styles.scss";
import { AIModel } from "@shared/types/global";

export function DualChatPage() {
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTypingGemini, setIsTypingGemini] = useState(false);
  const messagesEndRefGemini = useRef<HTMLDivElement>(null);
  const messagesEndRefGPT = useRef<HTMLDivElement>(null);
  const [isTypingGPT, setIsTypingGPT] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    loadUserMessages();

    socketService().connect();

    socketService().onConnect(() => {
      console.log("Socket connected");
    });

    socketService().onDisconnect(() => {
      console.log("Socket disconnected");
    });

    return () => {
      socketService().disconnect();
    };
  }, []);

  const loadUserMessages = async () => {
    const result = await to(() => getUserMessages());

    if (!result.ok) {
      console.error("Error loading messages:", result.error);
      return;
    }

    console.log("result.data.data", result.data.data);
    setMessages(result.data.data);
    setIsLoadingMessages(false);
  };

  const handleFeedback = async (messageId: number, winnerModel: AIModel) => {
    const result = await to(() => createFeedback({ messageId, winnerModel }));

    if (!result.ok) {
      console.error("Error submitting feedback:", result.error);
      return;
    }
  };

  useEffect(() => {
    if (!isLoadingMessages) {
      scrollIntoView(messagesEndRefGPT);
      scrollIntoView(messagesEndRefGemini);
    }
  }, [messages.length, isLoadingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    setIsTypingGPT(true);
    setIsTypingGemini(true);

    const result = await to(async () => {
      socketService().sendMessage(messageText, (data) => {
        console.log("onAck", data);

        const userMessage =
          data.messageWithLLMResponses as MessageWithLLMResponsesDTO;

        setMessages((prev) => [...prev, userMessage]);
      });
    });

    if (!result.ok) {
      console.error("Error sending message:", result.error);
    }

    setIsTypingGPT(false);
    setIsTypingGemini(false);
  };

  return (
    <div className="dual-chat-container">
      <ChatHeader />

      <div className="chat-windows-container">
        <ChatWindow
          chatType={AIModel.GPT_4O_MINI}
          title="GPT-4o-mini"
          isTyping={isTypingGPT}
          messagesEndRef={messagesEndRefGPT}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onFeedback={handleFeedback}
        />

        <ChatWindow
          chatType={AIModel.GEMINI_1_5_FLASH}
          title="Gemini 1.5-flash"
          isTyping={isTypingGemini}
          messagesEndRef={messagesEndRefGemini}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onFeedback={handleFeedback}
        />
      </div>

      <ChatInput
        handleSendMessage={handleSendMessage}
        inputText={inputText}
        setInputText={setInputText}
        isDisabled={isTypingGPT || isTypingGemini}
      />
    </div>
  );
}
