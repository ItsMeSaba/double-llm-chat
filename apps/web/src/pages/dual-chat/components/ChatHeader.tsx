import { useAuth } from "../../../base/context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function ChatHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  return (
    <div className="dual-chat-header">
      <h1>Dual LLM Chat</h1>

      <div className="header-buttons">
        <button
          onClick={() => navigate("/statistics")}
          className="statistics-btn"
        >
          Statistics
        </button>

        <button
          onClick={handleLogout}
          className="logout-btn"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
