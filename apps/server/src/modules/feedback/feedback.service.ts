import {
  fetchFeedback as fetchFeedbackFromRepo,
  insertFeedback as insertFeedbackToRepo,
  updateFeedback as updateFeedbackInRepo,
} from "./feedback.repo";

export const fetchFeedback = async (messageId: number) => {
  return await fetchFeedbackFromRepo(messageId);
};

export const insertFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await insertFeedbackToRepo(messageId, winnerModel);
};

export const updateFeedback = async (
  messageId: number,
  winnerModel: string
) => {
  return await updateFeedbackInRepo(messageId, winnerModel);
};
