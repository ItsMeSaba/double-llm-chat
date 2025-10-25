"use client";

import React, { useEffect, useRef } from "react";

import { TypingIndicator } from "@/components/modules/typing-indicator/TypingIndicator";
import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { scrollIntoView } from "@/base/utils/scroll-into-view";
import type { AIModel } from "@shared/types/global";
import { Message } from "./Message";

export interface FormattedMessage {
  id: number;
  content: string;
  sender: string;
  createdAt: Date;
  responses: {
    id: number;
    model: string;
    content: string;
  }[];
  feedback: {
    id: number;
    winnerModel: string;
  } | null;
}

interface ChatWindowProps {
  chatType: AIModel;
  title: string;
  isTyping: boolean;
  messages: MessageWithLLMResponsesDTO[];
  isLoadingMessages: boolean;
  onFeedback: (messageId: number, winnerModel: AIModel) => void;
}

export function ChatWindow({
  chatType,
  title,
  isTyping,
  messages,
  isLoadingMessages,
  onFeedback,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAiResponse = (message: MessageWithLLMResponsesDTO) => {
    return message?.responses?.find((response) => response.model === chatType);
  };

  useEffect(() => {
    if (!isLoadingMessages) {
      scrollIntoView(messagesEndRef);
    }
  }, [messages.length, isLoadingMessages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{title}</h2>
      </div>

      <div className="messages-container">
        {isLoadingMessages && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        )}

        {!isLoadingMessages &&
          messages?.map((message) => {
            const aiResponse = getAiResponse(message);

            return (
              <React.Fragment key={message.id}>
                <Message
                  message={{
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                  }}
                  sender="user"
                  onFeedback={onFeedback}
                />

                {aiResponse && (
                  <Message
                    message={{
                      id: message.id,
                      content: aiResponse.content,
                      createdAt: message.createdAt,
                      isLiked: message.feedback?.winnerModel === chatType,
                    }}
                    sender={chatType}
                    onFeedback={onFeedback}
                  />
                )}
              </React.Fragment>
            );
          })}

        {!isLoadingMessages && isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
