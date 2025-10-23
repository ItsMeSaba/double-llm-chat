import { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";

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

// interface FormattedMessage {
//   id: number;
//   content: string;
//   sender: string;
//   createdAt: Date;
//   responses: {
//     id: number;
//     model: string;
//     content: string;
//   }[];
//   feedback: {
//     id: number;
//     winnerModel: string;
//   } | null;
// }

export function messageAdapter(props: Props): MessageWithLLMResponsesDTO {
  return {
    id: props.messageId!,
    content: props.messageContent!,
    sender: props.messageSender!,
    createdAt: props.messageCreatedAt!,
    responses: [
      {
        id: props.gptResponseId!,
        model: "gpt-4o-mini",
        content: props.gptResponseContent!,
      },
      {
        id: props.geminiResponseId!,
        model: "gemini-1.5-flash",
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
