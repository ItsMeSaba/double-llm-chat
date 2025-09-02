import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../base/context/AuthProvider";
import { socketService } from "../../services/socketService";
import {
  fetchUserMessages,
  transformToSocketMessages,
} from "../../services/chatService";
import { submitFeedback } from "../../services/feedbackService";
import { ChatWindow } from "./components/ChatWindow";
import "./styles.scss";
import { isDuplicateMessage } from "./helpers/isDuplicateMessage";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "gpt-4o-mini" | "gemini-1.5-flash";
  timestamp: Date;
  messageId?: number;
}

export function DualChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isTypingGPT, setIsTypingGPT] = useState(false);
  const [isTypingGemini, setIsTypingGemini] = useState(false);
  const messagesEndRefGPT = useRef<HTMLDivElement>(null);
  const messagesEndRefGemini = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Map<number, string>>(
    new Map()
  );

  useEffect(() => {
    loadUserMessages();
  }, []);

  const loadUserMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetchUserMessages();
      const transformedMessages = transformToSocketMessages(response.data);
      setMessages(transformedMessages);

      // Load feedback data
      const newFeedbackMap = new Map<number, string>();

      response.data.forEach((message) => {
        if (message?.feedback?.winnerModel) {
          newFeedbackMap.set(message.id, message.feedback.winnerModel);
        }
      });

      setFeedbackMap(newFeedbackMap);
    } catch (error) {
      console.error("Error loading messages:", error);

      // If no messages exist or there's an error, show default welcome messages
      setMessages([
        {
          id: "welcome-gpt",
          text: "Hello! I'm GPT-4o-mini. How can I help you today?",
          sender: "gpt-4o-mini",
          timestamp: new Date(),
        },
        {
          id: "welcome-gemini",
          text: "Hi there! I'm Gemini 1.5-flash. Ready to assist you!",
          sender: "gemini-1.5-flash",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFeedback = async (
    messageId: number,
    winnerModel: "gpt-4o-mini" | "gemini-1.5-flash"
  ) => {
    try {
      await submitFeedback({ messageId, winnerModel });

      // Update local feedback state
      setFeedbackMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(messageId, winnerModel);
        return newMap;
      });

      console.log(
        `Feedback submitted: ${winnerModel} is better for message ${messageId}`
      );
    } catch (error) {
      console.error(`Error submitting feedback:`, error);
    }
  };

  useEffect(() => {
    if (!isLoadingMessages) {
      scrollToBottom(messagesEndRefGPT);
    }
  }, [
    messages.filter((m) => m.sender === "gpt-4o-mini" || m.sender === "user"),
    isLoadingMessages,
  ]);

  useEffect(() => {
    if (!isLoadingMessages) {
      scrollToBottom(messagesEndRefGemini);
    }
  }, [
    messages.filter(
      (m) => m.sender === "gemini-1.5-flash" || m.sender === "user"
    ),
    isLoadingMessages,
  ]);

  useEffect(() => {
    socketService.connect();

    socketService.onLLMResponses((data) => {
      data.responses.forEach((response) => {
        const aiMessage: Message = {
          id: `response-${response.messageId}-${response.model}`,
          text: response.response,
          sender: response.model as "gpt-4o-mini" | "gemini-1.5-flash",
          timestamp: new Date(),
          messageId: response.messageId,
        };

        // Check if this response already exists to prevent duplicates
        setMessages((prev) => {
          if (isDuplicateMessage(aiMessage, prev)) {
            console.log("Response already exists, skipping duplicate");
            return prev;
          }

          return [...prev, aiMessage];
        });
      });

      // Clear typing indicators
      setIsTypingGPT(false);
      setIsTypingGemini(false);
    });

    socketService.onError((data) => {
      console.error("Socket error:", data.message);
      setIsTypingGPT(false);
      setIsTypingGemini(false);
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    // Set typing indicators for both models
    setIsTypingGPT(true);
    setIsTypingGemini(true);

    try {
      socketService.sendMessage(messageText, (data) => {
        const userMessage: Message = {
          id: data.messageId.toString(),
          text: messageText,
          sender: "user",
          timestamp: new Date(data.timestamp),
          messageId: data.messageId,
        };

        // Check if this message already exists to prevent duplicates
        setMessages((prev) => {
          if (isDuplicateMessage(userMessage, prev)) {
            console.log("User message already exists, skipping duplicate");
            return prev;
          }

          return [...prev, userMessage];
        });
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTypingGPT(false);
      setIsTypingGemini(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  const handleStatisticsClick = () => {
    navigate("/statistics");
  };

  const getMessagesForChat = (chatType: "gpt-4o-mini" | "gemini-1.5-flash") => {
    return messages.filter(
      (message) => message.sender === chatType || message.sender === "user"
    );
  };

  return (
    <div className="dual-chat-container">
      <div className="dual-chat-header">
        <h1>Dual LLM Chat</h1>
        <div className="header-buttons">
          <button onClick={handleStatisticsClick} className="statistics-btn">
            Statistics
          </button>
          <button
            onClick={handleLogout}
            className="logout-btn"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      <div className="chat-windows-container">
        <ChatWindow
          chatType="gpt-4o-mini"
          title="GPT-4o-mini"
          isTyping={isTypingGPT}
          messagesEndRef={messagesEndRefGPT}
          messages={getMessagesForChat("gpt-4o-mini")}
          isLoadingMessages={isLoadingMessages}
          feedbackMap={feedbackMap}
          onFeedback={handleFeedback}
        />

        <ChatWindow
          chatType="gemini-1.5-flash"
          title="Gemini 1.5-flash"
          isTyping={isTypingGemini}
          messagesEndRef={messagesEndRefGemini}
          messages={getMessagesForChat("gemini-1.5-flash")}
          isLoadingMessages={isLoadingMessages}
          feedbackMap={feedbackMap}
          onFeedback={handleFeedback}
        />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to both LLM models..."
            className="message-input"
            disabled={isTypingGPT || isTypingGemini}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || isTypingGPT || isTypingGemini}
          >
            Send to Both
          </button>
        </div>
      </form>
    </div>
  );
}
