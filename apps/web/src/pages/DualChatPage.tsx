import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../base/context/AuthProvider";
import { socketService } from "../services/socketService";
import {
  fetchUserMessages,
  transformToSocketMessages,
  type DualChatMessage,
} from "../services/chatService";
import "./DualChatPage.scss";

interface Message {
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

  useEffect(() => {
    loadUserMessages();
  }, []);

  const loadUserMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const response = await fetchUserMessages();
      console.log("response.data.messages", response.data.messages);
      const transformedMessages = transformToSocketMessages(
        response.data.messages
      );
      setMessages(transformedMessages);
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
      console.log("LLM responses received:", data);

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
      // Send message via Socket.IO and wait for confirmation
      socketService.sendMessage(messageText, (data) => {
        console.log("Message received:", data);

        // Add the user message to state only after server confirmation
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
      // Clear typing indicators on error
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessagesForChat = (chatType: "gpt-4o-mini" | "gemini-1.5-flash") => {
    return messages.filter(
      (message) => message.sender === chatType || message.sender === "user"
    );
  };

  // Utility function to check for duplicate messages
  const isDuplicateMessage = (
    newMessage: Message,
    existingMessages: Message[]
  ): boolean => {
    return existingMessages.some((existing) => {
      // Check by messageId first (most reliable)
      if (
        newMessage.messageId &&
        existing.messageId &&
        newMessage.messageId === existing.messageId
      ) {
        return true;
      }

      // Check by content and sender (fallback)
      if (
        newMessage.text === existing.text &&
        newMessage.sender === existing.sender
      ) {
        // Only consider it duplicate if sent within 5 seconds
        const timeDiff = Math.abs(
          newMessage.timestamp.getTime() - existing.timestamp.getTime()
        );
        return timeDiff < 5000;
      }

      return false;
    });
  };

  const renderChatWindow = (
    chatType: "gpt-4o-mini" | "gemini-1.5-flash",
    title: string,
    isTyping: boolean,
    messagesEndRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const chatMessages = getMessagesForChat(chatType);

    return (
      <div className="chat-window">
        <div className="chat-header">
          <h2>{title}</h2>
        </div>

        <div className="messages-container">
          {isLoadingMessages ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === "user" ? "user-message" : "ai-message"}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}

          {!isLoadingMessages && isTyping && (
            <div className="message ai-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  };

  return (
    <div className="dual-chat-container">
      <div className="dual-chat-header">
        <h1>Dual LLM Chat (Socket.IO)</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="chat-windows-container">
        {renderChatWindow(
          "gpt-4o-mini",
          "GPT-4o-mini",
          isTypingGPT,
          messagesEndRefGPT
        )}
        {renderChatWindow(
          "gemini-1.5-flash",
          "Gemini 1.5-flash",
          isTypingGemini,
          messagesEndRefGemini
        )}
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
