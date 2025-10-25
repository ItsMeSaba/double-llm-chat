import styles from "../styles.module.scss";

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
    <div className={styles["summary-section"]}>
      <h2>Summary</h2>

      <div className={styles["summary-cards"]}>
        {data.map((item) => (
          <div className={styles["summary-card gpt-card"]}>
            <h3>{item.name}</h3>
            <div className={styles["count"]}>{item.value}</div>
            <div className={styles["label"]}>Likes</div>
          </div>
        ))}
      </div>
    </div>
  );
}
