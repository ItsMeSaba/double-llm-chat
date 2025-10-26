import { getMessages, sendMessage } from "./messages.controller";
import { Router } from "express";

const router = Router();

router.get("/messages", getMessages);
router.post("/send", sendMessage);

export { router as messagesRoutes };
