interface Props {
  onBack: () => void;
}

export function Loading({ onBack }: Props) {
  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <div className="header-section">
          <button onClick={onBack} className="back-button">
            Back to Chat
          </button>

          <h1>Statistics Dashboard</h1>
        </div>

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    </div>
  );
}
