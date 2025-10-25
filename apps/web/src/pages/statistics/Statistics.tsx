import {
  ResponsiveContainer,
  PieChart,
  Tooltip,
  Legend,
  Cell,
  Pie,
} from "recharts";

import {
  type StatisticsResponse,
  fetchStatistics,
} from "@/services/statisticsService";

import { CustomLabel } from "./components/CustomLabel";
import { Loading } from "./components/Loading";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Cards } from "./components/Cards";
import { Error } from "./components/Error";
import { to } from "@/base/utils/to";

import styles from "./styles.module.scss";

const COLORS = ["#667eea", "#764ba2"];

export function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    const result = await to(() => fetchStatistics());

    if (!result.ok) {
      setError(String(result.error) || "Failed to load statistics");
    } else {
      setStatistics(result.data.data);
    }

    setLoading(false);
  };

  const handleBackClick = () => {
    navigate("/dual-chat");
  };

  if (loading) {
    return <Loading onBack={handleBackClick} />;
  }

  if (error) {
    return (
      <Error onRetry={loadStatistics} onBack={handleBackClick} error={error} />
    );
  }

  return (
    <div className={styles["statistics-page"]}>
      <div className={styles["statistics-container"]}>
        <div className={styles["header-section"]}>
          <button onClick={handleBackClick} className={styles["back-button"]}>
            Back to Chat
          </button>

          <h1>Statistics Dashboard</h1>
        </div>

        {statistics && (
          <div className={styles["statistics-content"]}>
            <div className={styles["chart-section"]}>
              <h2>Model Preference Distribution</h2>

              <div className={styles["chart-container"]}>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistics.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value: number) => [`${value} likes`, "Count"]}
                      labelFormatter={(label: string) => `Model: ${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Cards
              gptLikes={statistics.summary.gptLikes}
              geminiLikes={statistics.summary.geminiLikes}
              totalFeedback={statistics.totalFeedback}
            />

            {statistics.totalFeedback === 0 && (
              <div className={styles["no-data-section"]}>
                <h2>No Data Available</h2>

                <p>
                  You haven't provided feedback on any messages yet. Start
                  chatting and like responses to see statistics here!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
