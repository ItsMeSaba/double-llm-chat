import React from "react";
import "./StatisticsPage.scss";

export const StatisticsPage: React.FC = () => {
  console.log("STATISTICS PAGE");
  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <h1>Statistics Dashboard</h1>

        <div className="statistics-content">
          <div className="statistics-section">
            <h2>Overview</h2>
            <p>
              Welcome to the statistics dashboard. This page will display
              various charts and analytics using Recharts.
            </p>
          </div>

          <div className="statistics-section">
            <h2>Data Visualization</h2>
            <p>
              Charts and graphs will be implemented here to show user
              engagement, message statistics, and other relevant metrics.
            </p>
          </div>

          <div className="statistics-section">
            <h2>Coming Soon</h2>
            <p>
              This is a placeholder page. The actual statistics and charts will
              be added in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
