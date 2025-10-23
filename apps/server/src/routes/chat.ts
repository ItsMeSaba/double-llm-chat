import { getOrCreateChat } from "../base/helpers/chat/get-or-create-chat";
import { messageAdapter } from "../base/adapters/messages.adapter";
import { messages, modelResponses, feedback } from "../db/schema";
import { Router, Request, Response } from "express";
import { eq, asc, count, and } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "../db";
import { AIModel } from "@shared/types/global";

const router = Router();

// GET /messages - Fetch messages for the authenticated user
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = parseInt(user.userId);

    // Get or create chat for the user
    const chat = await getOrCreateChat(userId);
    if (!chat) {
      return res.status(500).json({ error: "Failed to retrieve chat" });
    }

    const gptResponse = alias(modelResponses, "gpt_response");
    const geminiResponse = alias(modelResponses, "gemini_response");

    // Fetch messages with their model responses and feedback
    const messagesWithResponses = await db
      .select({
        messageId: messages.id,
        messageContent: messages.content,
        messageSender: messages.sender,
        messageCreatedAt: messages.createdAt,
        gptResponseId: gptResponse.id,
        gptResponseContent: gptResponse.response,
        geminiResponseId: geminiResponse.id,
        geminiResponseContent: geminiResponse.response,
        feedbackId: feedback.id,
        winnerModel: feedback.winnerModel,
      })
      .from(messages)
      .fullJoin(
        gptResponse,
        and(
          eq(messages.id, gptResponse.messageId),
          eq(gptResponse.model, AIModel.GPT_4O_MINI)
        )
      )
      .fullJoin(
        geminiResponse,
        and(
          eq(messages.id, geminiResponse.messageId),
          eq(geminiResponse.model, AIModel.GEMINI_1_5_FLASH)
        )
      )
      .leftJoin(feedback, eq(messages.id, feedback.messageId))
      .where(eq(messages.chatId, chat.id))
      .orderBy(asc(messages.createdAt));

    const formattedMessages = messagesWithResponses.map((message) =>
      messageAdapter(message)
    );

    return res.status(200).json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /send - Send a message
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const chat = await getOrCreateChat(parseInt(user.userId));
    if (!chat) {
      return res
        .status(500)
        .json({ error: "Failed to create or retrieve chat" });
    }

    // Save the message to the database
    const savedMessage = await db
      .insert(messages)
      .values({
        chatId: chat.id,
        sender: "user",
        content: message.trim(),
      })
      .returning();

    if (!savedMessage || savedMessage.length === 0) {
      return res.status(500).json({ error: "Failed to save message" });
    }

    // Return success response with the saved message
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: savedMessage[0].id,
        chatId: chat.id,
        content: savedMessage[0].content,
        sender: savedMessage[0].sender,
        createdAt: savedMessage[0].createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /feedback - Save user feedback for LLM responses
router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const { messageId, winnerModel } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (typeof messageId !== "number" || !winnerModel) {
      return res.status(400).json({
        error: "Message ID and winner model are required",
      });
    }

    if (!["gpt-4o-mini", "gemini-1.5-flash"].includes(winnerModel)) {
      return res.status(400).json({
        error:
          "Invalid winner model. Must be 'gpt-4o-mini' or 'gemini-1.5-flash'",
      });
    }

    // Check if feedback already exists for this message
    const existingFeedback = await db
      .select()
      .from(feedback)
      .where(eq(feedback.messageId, messageId))
      .limit(1);

    if (existingFeedback.length > 0) {
      // Update existing feedback
      await db
        .update(feedback)
        .set({
          winnerModel,
          createdAt: new Date(),
        })
        .where(eq(feedback.messageId, messageId));
    } else {
      // Create new feedback
      await db.insert(feedback).values({
        messageId,
        winnerModel,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback saved successfully",
      data: {
        messageId,
        winnerModel,
      },
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /statistics - Get feedback statistics for the authenticated user
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = parseInt(user.userId);

    // Get or create chat for the user
    const chat = await getOrCreateChat(userId);
    if (!chat) {
      return res.status(500).json({ error: "Failed to retrieve chat" });
    }

    // Get feedback statistics
    const feedbackStats = await db
      .select({
        winnerModel: feedback.winnerModel,
        count: count(),
      })
      .from(feedback)
      .innerJoin(messages, eq(feedback.messageId, messages.id))
      .where(eq(messages.chatId, chat.id))
      .groupBy(feedback.winnerModel);

    // Format the data for the pie chart
    const chartData = feedbackStats.map((stat) => ({
      name:
        stat.winnerModel === "gpt-4o-mini" ? "GPT-4o Mini" : "Gemini 1.5 Flash",
      value: stat.count,
      model: stat.winnerModel,
    }));

    // Calculate total feedback count
    const totalFeedback = feedbackStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        chartData,
        totalFeedback,
        summary: {
          gptLikes:
            feedbackStats.find((stat) => stat.winnerModel === "gpt-4o-mini")
              ?.count || 0,
          geminiLikes:
            feedbackStats.find(
              (stat) => stat.winnerModel === "gemini-1.5-flash"
            )?.count || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export { router as chatRoutes };
