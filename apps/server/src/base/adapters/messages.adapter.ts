import { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";
import { AIModel } from "@shared/types/global";

interface Props {
  messageId?: number | null;
  messageContent?: string | null;
  messageSender?: string | null;
  messageCreatedAt?: Date | null;
  gptResponseId?: number | null;
  gptResponseContent?: string | null;
  geminiResponseId?: number | null;
  geminiResponseContent?: string | null;
  feedbackId?: number | null;
  winnerModel?: string | null;
}

export function messageAdapter(props: Props): MessageWithLLMResponsesDTO {
  return {
    id: props.messageId!,
    content: props.messageContent!,
    sender: props.messageSender!,
    createdAt: props.messageCreatedAt!,
    responses: [
      {
        id: props.gptResponseId!,
        model: AIModel.GPT_4O_MINI,
        content: props.gptResponseContent!,
      },
      {
        id: props.geminiResponseId!,
        model: AIModel.GEMINI_1_5_FLASH,
        content: props.geminiResponseContent!,
      },
    ],
    feedback: props.feedbackId
      ? {
          id: props.feedbackId!,
          winnerModel: props.winnerModel!,
        }
      : null,
  };
}
