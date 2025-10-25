import styles from "../styles.module.scss";

interface Props {
  onBack: () => void;
}

export function Loading({ onBack }: Props) {
  return (
    <div className={styles["statistics-page"]}>
      <div className={styles["statistics-container"]}>
        <div className={styles["header-section"]}>
          <button onClick={onBack} className={styles["back-button"]}>
            Back to Chat
          </button>

          <h1>Statistics Dashboard</h1>
        </div>

        <div className={styles["loading-container"]}>
          <div className={styles["loading-spinner"]}></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    </div>
  );
}
