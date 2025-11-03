import type { Message } from "../DualChat";

export const isDuplicateMessage = (
  newMessage: Message,
  existingMessages: Message[]
): boolean => {
  return existingMessages.some((existing) => {
    if (
      newMessage.messageId &&
      existing.messageId &&
      newMessage.messageId === existing.messageId &&
      newMessage.sender === existing.sender
    ) {
      return true;
    }

    // Check by content and sender (fallback)
    if (newMessage.text === existing.text) {
      // Only consider it duplicate if sent within 5 seconds
      const timeDiff = Math.abs(
        newMessage.timestamp.getTime() - existing.timestamp.getTime()
      );
      return timeDiff < 5000;
    }

    return false;
  });
};
