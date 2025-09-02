import { useState } from "react";
import { logout } from "../service/auth";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const result = await logout();

      if (result.success) {
        navigate("/");
      } else {
        console.warn("Logout warning:", result.error);
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="user-menu">
      <button
        onClick={handleLogout}
        className="logout-btn"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
