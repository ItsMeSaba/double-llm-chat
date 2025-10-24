// @ts-ignore
import ThumbsUpIcon from "../../../assets/thumbs-up.svg?react";

import { formatMessageTime } from "@/base/utils/format-message-time";
import type { AIModel } from "@shared/types/global";

interface Props {
  message: {
    isLiked?: boolean;
    createdAt: Date;
    content: string;
    id: number;
  };
  sender: "user" | AIModel;
  onFeedback: (messageId: number, winnerModel: AIModel) => void;
}

export function Message({ message, sender, onFeedback }: Props) {
  const isLiked = sender !== "user" && message.isLiked;

  return (
    <div
      key={message.id}
      className={`message ${sender === "user" ? "user-message" : "ai-message"}`}
    >
      <div className="message-content">
        <p className="message-text">{message.content}</p>
        <span className="message-time">
          {formatMessageTime(message?.createdAt)}
        </span>

        {sender !== "user" && (
          <button
            className={`like-btn ${isLiked && "liked"}`}
            onClick={() => onFeedback(message.id!, sender)}
            title="Mark this response as better"
          >
            <ThumbsUpIcon style={{ color: isLiked ? "white" : "black" }} />
          </button>
        )}
      </div>
    </div>
  );
}
