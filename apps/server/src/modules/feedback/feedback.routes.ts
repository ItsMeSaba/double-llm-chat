import { saveFeedback, getFeedbackStatistics } from "./feedback.controller";
import { Router } from "express";

const router = Router();

router.post("/feedback", saveFeedback);
router.get("/statistics", getFeedbackStatistics);

export { router as feedbackRoutes };
