import styles from "../styles.module.scss";

interface Props {
  onRetry: () => void;
  onBack: () => void;
  error: string;
}

export function Error({ onRetry, onBack, error }: Props) {
  return (
    <div className={styles["statistics-page"]}>
      <div className={styles["statistics-container"]}>
        <div className={styles["header-section"]}>
          <button onClick={onBack} className={styles["back-button"]}>
            Back to Chat
          </button>
          <h1>Statistics Dashboard</h1>
        </div>
        <div className={styles["error-container"]}>
          <p className={styles["error-message"]}>{error}</p>
          <button onClick={onRetry} className={styles["retry-button"]}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
