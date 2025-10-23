import styles from "./styles.module.scss";

export function TypingIndicator() {
  return (
    <div className={`${styles.message} ${styles["ai-message"]}`}>
      <div className={styles["message-content"]}>
        <div className={styles["typing-indicator"]}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
