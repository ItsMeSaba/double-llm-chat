import React from "react";
// @ts-ignore
import ThumbsUpIcon from "../../../assets/thumbs-up.svg?react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "gpt-4o-mini" | "gemini-1.5-flash";
  timestamp: Date;
  messageId?: number;
}

interface ChatWindowProps {
  chatType: "gpt-4o-mini" | "gemini-1.5-flash";
  title: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messages: Message[];
  isLoadingMessages: boolean;
  feedbackMap: Map<number, string>;
  onFeedback: (
    messageId: number,
    winnerModel: "gpt-4o-mini" | "gemini-1.5-flash"
  ) => void;
}

export function ChatWindow({
  chatType,
  title,
  isTyping,
  messagesEndRef,
  messages,
  isLoadingMessages,
  feedbackMap,
  onFeedback,
}: ChatWindowProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
          messages.map((message) => {
            const isLiked =
              feedbackMap.get(message?.messageId || -1) === chatType;

            return (
              <div
                key={message.id}
                className={`message ${message.sender === "user" ? "user-message" : "ai-message"}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>

                  {message.sender !== "user" && (
                    <button
                      className={`like-btn ${isLiked && "liked"}`}
                      onClick={() => onFeedback(message.messageId!, chatType)}
                      title="Mark this response as better"
                    >
                      <ThumbsUpIcon
                        style={{ color: isLiked ? "white" : "black" }}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })
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
}
