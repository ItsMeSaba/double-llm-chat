interface Props {
  onRetry: () => void;
  onBack: () => void;
  error: string;
}

export function Error({ onRetry, onBack, error }: Props) {
  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <div className="header-section">
          <button onClick={onBack} className="back-button">
            Back to Chat
          </button>
          <h1>Statistics Dashboard</h1>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
