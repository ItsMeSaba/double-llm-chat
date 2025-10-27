import { useSocketConnection } from "@/base/hooks/use-socket-connection";
import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { createFeedback } from "@/services/feedback/create-feedback";
import { useUserMessages } from "@/base/hooks/use-user-messages";
import { socketService } from "@/services/socketService";
import { ChatWindow } from "./components/ChatWindow";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { AIModel } from "@shared/types/global";
import { to } from "@/base/utils/to";
import { useState } from "react";
import "./styles.scss";

export function DualChatPage() {
  const [temporaryMessage, setTemporaryMessage] = useState<string>("");
  const [isTypingGemini, setIsTypingGemini] = useState(false);
  const [isTypingGPT, setIsTypingGPT] = useState(false);
  const [inputText, setInputText] = useState("");
  const {
    messages,
    loading: isLoadingMessages,
    setMessages,
  } = useUserMessages();

  useSocketConnection();

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

    setTemporaryMessage(messageText); // will get replaced by the message from the server

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
