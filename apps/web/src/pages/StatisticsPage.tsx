import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  fetchStatistics,
  type StatisticsResponse,
} from "../services/statisticsService";
import "./StatisticsPage.scss";

const COLORS = ["#667eea", "#764ba2"];

export const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchStatistics();
      setStatistics(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/dual-chat");
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <div className="header-section">
            <button onClick={handleBackClick} className="back-button">
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

  if (error) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <div className="header-section">
            <button onClick={handleBackClick} className="back-button">
              Back to Chat
            </button>
            <h1>Statistics Dashboard</h1>
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={loadStatistics} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <div className="header-section">
          <button onClick={handleBackClick} className="back-button">
            Back to Chat
          </button>
          <h1>Statistics Dashboard</h1>
        </div>

        {statistics && (
          <div className="statistics-content">
            <div className="chart-section">
              <h2>Model Preference Distribution</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={statistics.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
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

            <div className="summary-section">
              <h2>Summary</h2>
              <div className="summary-cards">
                <div className="summary-card gpt-card">
                  <h3>GPT-4o Mini</h3>
                  <div className="count">{statistics.summary.gptLikes}</div>
                  <div className="label">Likes</div>
                </div>
                <div className="summary-card gemini-card">
                  <h3>Gemini 1.5 Flash</h3>
                  <div className="count">{statistics.summary.geminiLikes}</div>
                  <div className="label">Likes</div>
                </div>
                <div className="summary-card total-card">
                  <h3>Total Feedback</h3>
                  <div className="count">{statistics.totalFeedback}</div>
                  <div className="label">Messages</div>
                </div>
              </div>
            </div>

            {statistics.totalFeedback === 0 && (
              <div className="no-data-section">
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
};
