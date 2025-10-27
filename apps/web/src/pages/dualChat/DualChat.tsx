import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { getUserMessages } from "@/services/messages/get-user-messages";
import { createFeedback } from "@/services/feedback/create-feedback";
import { socketService } from "@/services/socketService";
import { ChatWindow } from "./components/ChatWindow";
import { ChatHeader } from "./components/ChatHeader";
import { useState, useEffect } from "react";
import { ChatInput } from "./components/ChatInput";
import { to } from "@/base/utils/to";
import "./styles.scss";
import { AIModel } from "@shared/types/global";
import { useSocketConnection } from "@/base/hooks/use-socket-connection";

export function DualChatPage() {
  const [temporaryMessage, setTemporaryMessage] = useState<string>("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTypingGemini, setIsTypingGemini] = useState(false);
  const [isTypingGPT, setIsTypingGPT] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  useSocketConnection();

  useEffect(() => {
    loadUserMessages();
  }, []);

  const loadUserMessages = async () => {
    const result = await to(() => getUserMessages());

    if (!result.ok) {
      console.error("Error loading messages:", result.error);
    } else {
      setMessages(result.data.data);
    }

    setIsLoadingMessages(false);
  };

  const handleFeedback = async (messageId: number, winnerModel: AIModel) => {
    const result = await to(() => createFeedback({ messageId, winnerModel }));

    if (!result.ok) {
      console.error("Error submitting feedback:", result.error);
      return;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    setIsTypingGPT(true);
    setIsTypingGemini(true);

    setTemporaryMessage(messageText);

    const result = await to(async () => {
      socketService().sendMessage(messageText, (data) => {
        const userMessage =
          data.messageWithLLMResponses as MessageWithLLMResponsesDTO;

        setMessages((prev) => [...prev, userMessage]);
        setTemporaryMessage("");
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
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onFeedback={handleFeedback}
          temporaryMessage={temporaryMessage}
        />

        <ChatWindow
          chatType={AIModel.GEMINI_1_5_FLASH}
          title="Gemini 1.5-flash"
          isTyping={isTypingGemini}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onFeedback={handleFeedback}
          temporaryMessage={temporaryMessage}
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
