import { fetchMessages, insertMessage } from "./messages.service";
import { Request, Response } from "express";
import { to } from "@shared/utils/to";

export const getMessages = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const fetchedMessages = await to(() => fetchMessages(Number(user.userId)));

  if (!fetchedMessages.ok) {
    console.error("Error fetching messages:", fetchedMessages.error);
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.status(200).json({ success: true, data: fetchedMessages.data });
};

export const sendMessage = async (req: Request, res: Response) => {
  const { message } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const insertedMessage = await to(() =>
    insertMessage(Number(user.userId), "user", message)
  );

  if (!insertedMessage.ok) {
    console.error("Error sending message:", insertedMessage.error);
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.status(201).json({ success: true, data: insertedMessage.data });
};
