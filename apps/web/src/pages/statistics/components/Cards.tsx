interface Props {
  gptLikes: number;
  geminiLikes: number;
  totalFeedback: number;
}

export function Cards({ gptLikes, geminiLikes, totalFeedback }: Props) {
  const data = [
    {
      name: "GPT-4o Mini",
      value: gptLikes,
    },
    {
      name: "Gemini 1.5 Flash",
      value: geminiLikes,
    },
    {
      name: "Total Feedback",
      value: totalFeedback,
    },
  ];

  return (
    <div className="summary-section">
      <h2>Summary</h2>

      <div className="summary-cards">
        {data.map((item) => (
          <div className="summary-card gpt-card">
            <h3>{item.name}</h3>
            <div className="count">{item.value}</div>
            <div className="label">Likes</div>
          </div>
        ))}
      </div>
    </div>
  );
}
