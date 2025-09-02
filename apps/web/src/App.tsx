import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/Login/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { DualChatPage } from "./pages/DualChatPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.scss";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

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

          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
