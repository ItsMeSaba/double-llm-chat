import {
  fetchMessages as fetchMessagesFromRepo,
  insertMessage as insertMessageToRepo,
} from "./messages.repo";

export const fetchMessages = async (userId: number) => {
  return await fetchMessagesFromRepo(userId);
};

export const insertMessage = async (
  userId: number,
  sender: string,
  content: string
) => {
  return await insertMessageToRepo(userId, sender, content);
};
