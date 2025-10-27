import {
  fetchMessagesWithDetails,
  insertMessage as insertMessageToRepo,
} from "./messages.repo";

export const fetchMessages = async (chatId: number) => {
  return await fetchMessagesWithDetails(chatId);
};

export const insertMessage = async (
  chatId: number,
  sender: string,
  content: string
) => {
  return await insertMessageToRepo(chatId, sender, content);
};
