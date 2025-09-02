import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/login/Login";
import { DualChatPage } from "./pages/dualChat/DualChat";
import { StatisticsPage } from "./pages/statistics/Statistics";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.scss";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/dual-chat"
            element={
              <ProtectedRoute>
                <DualChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
