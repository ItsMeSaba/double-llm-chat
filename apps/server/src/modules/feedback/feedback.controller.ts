import {
  insertFeedback,
  updateFeedback,
  fetchFeedback,
  getFeedbackStats,
} from "./feedback.service";
import { Request, Response } from "express";
import { to } from "@shared/utils/to";

export const saveFeedback = async (req: Request, res: Response) => {
  const { messageId, winnerModel } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  if (typeof messageId !== "number" || !winnerModel) {
    return res
      .status(400)
      .json({ error: "Message ID and winner model are required" });
  }

  const existingFeedback = await to(() => fetchFeedback(messageId));

  if (!existingFeedback.ok) {
    console.error("Error saving feedback:", existingFeedback.error);
    return res.status(500).json({ error: "Internal server error" });
  }

  if (existingFeedback.data.length > 0) {
    await updateFeedback(messageId, winnerModel);
  } else {
    await insertFeedback(messageId, winnerModel);
  }

  return res
    .status(200)
    .json({ success: true, message: "Feedback saved successfully" });
};

export const getFeedbackStatistics = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = parseInt(user.userId);

  const feedbackStats = await getFeedbackStats(userId);

  if (!feedbackStats) {
    return res
      .status(500)
      .json({ error: "Failed to retrieve feedback statistics" });
  }

  return res.status(200).json({ success: true, data: feedbackStats });
};
