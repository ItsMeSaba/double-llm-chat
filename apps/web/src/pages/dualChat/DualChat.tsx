import { getUserMessages } from "@/services/messages/get-user-messages";
import { createFeedback } from "@/services/feedback/create-feedback";
import { isDuplicateMessage } from "./helpers/is-duplicate-message";
import { scrollIntoView } from "@/base/utils/scroll-into-view";
import { socketService } from "@/services/socketService";
import { ChatWindow } from "./components/ChatWindow";
import { ChatHeader } from "./components/ChatHeader";
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./components/ChatInput";
import { AIModel } from "@/types/global";
import "./styles.scss";
import { to } from "@/base/utils/to";

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
  }, []);

  const loadUserMessages = async () => {
    const result = await to(() => getUserMessages());

    if (!result.ok) {
      console.error("Error loading messages:", result.error);
      return;
    }

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

  useEffect(() => {
    socketService().connect();

    socketService().onLLMResponses((data) => {
      data.responses.forEach((response) => {
        // const aiMessage: any = {
        //   id: `response-${response.messageId}-${response.model}`,
        //   text: response.response,
        //   sender: response.model as AIModel,
        //   timestamp: new Date(),
        //   messageId: response.messageId,
        // };
        // setMessages((prev) => [...prev, aiMessage]);
        // Check if this response already exists to prevent duplicates
        // setMessages((prev) => {
        //   if (isDuplicateMessage(aiMessage, prev)) {
        //     console.log("Response already exists, skipping duplicate");
        //     return prev;
        //   }
        //   return [...prev, aiMessage];
        // });
      });

      setIsTypingGPT(false);
      setIsTypingGemini(false);
    });

    socketService().onError((data) => {
      console.error("Socket error:", data.message);
      setIsTypingGPT(false);
      setIsTypingGemini(false);
    });

    return () => {
      socketService().disconnect();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    setIsTypingGPT(true);
    setIsTypingGemini(true);

    console.log("sending message dual chat:");

    const result = await to(async () => {
      socketService().sendMessage(messageText, (data) => {
        console.log("onAck", data);
        const userMessage: any = {
          id: data?.messageId?.toString(),
          text: messageText,
          sender: "user",
          timestamp: new Date(data.timestamp),
          messageId: data.messageId,
        };

        setMessages((prev) => {
          if (isDuplicateMessage(userMessage, prev)) {
            // Used to resolve weird message duplication as temporary workaround solution
            console.log("User message already exists, skipping duplicate");
            return prev;
          }

          return [...prev, userMessage];
        });
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
