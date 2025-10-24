import styles from "./styles.module.scss";

export function TypingIndicator() {
  return (
    <div className={styles.message}>
      <div className={styles.content}>
        <div className={styles.typingIndicator}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
