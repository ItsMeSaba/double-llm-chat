import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DualChatPage.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai1" | "ai2";
  timestamp: Date;
}

export function DualChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm AI Model 1. How can I help you today?",
      sender: "ai1",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Hi there! I'm AI Model 2. Ready to assist you!",
      sender: "ai2",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping1, setIsTyping1] = useState(false);
  const [isTyping2, setIsTyping2] = useState(false);
  const messagesEndRef1 = useRef<HTMLDivElement>(null);
  const messagesEndRef2 = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(messagesEndRef1);
  }, [messages.filter((m) => m.sender === "ai1" || m.sender === "user")]);

  useEffect(() => {
    scrollToBottom(messagesEndRef2);
  }, [messages.filter((m) => m.sender === "ai2" || m.sender === "user")]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate AI 1 response
    setIsTyping1(true);
    setTimeout(() => {
      const ai1Message: Message = {
        id: (Date.now() + 1).toString(),
        text: `AI Model 1: I received your message: "${inputText.trim()}". This is a demo response from the first AI model.`,
        sender: "ai1",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, ai1Message]);
      setIsTyping1(false);
    }, 1500);

    // Simulate AI 2 response
    setIsTyping2(true);
    setTimeout(() => {
      const ai2Message: Message = {
        id: (Date.now() + 2).toString(),
        text: `AI Model 2: I also received: "${inputText.trim()}". Here's my perspective on this topic.`,
        sender: "ai2",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, ai2Message]);
      setIsTyping2(false);
    }, 2000);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessagesForChat = (chatType: "ai1" | "ai2") => {
    return messages.filter(
      (message) => message.sender === chatType || message.sender === "user"
    );
  };

  const renderChatWindow = (
    chatType: "ai1" | "ai2",
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
          {chatMessages.map((message) => (
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
          ))}

          {isTyping && (
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
        <h1>Dual AI Chat</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="chat-windows-container">
        {renderChatWindow("ai1", "GPT-4.5", isTyping1, messagesEndRef1)}
        {renderChatWindow("ai2", "Gemini 1.5", isTyping2, messagesEndRef2)}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to both AI models..."
            className="message-input"
            disabled={isTyping1 || isTyping2}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || isTyping1 || isTyping2}
          >
            Send to Both
          </button>
        </div>
      </form>
    </div>
  );
}
