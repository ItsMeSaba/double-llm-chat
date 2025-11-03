interface Props {
  handleSendMessage: (e: React.FormEvent) => void;
  inputText: string;
  setInputText: (text: string) => void;
  isDisabled: boolean;
}

export function ChatInput({
  handleSendMessage,
  inputText,
  setInputText,
  isDisabled,
}: Props) {
  return (
    <form onSubmit={handleSendMessage} className="message-input-form">
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message to both LLM models..."
          className="message-input"
          disabled={isDisabled}
        />

        <button type="submit" className="send-btn" disabled={isDisabled}>
          Send to Both
        </button>
      </div>
    </form>
  );
}
