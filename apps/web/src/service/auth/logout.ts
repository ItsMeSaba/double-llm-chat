import { http } from "../http";
import { setAccessToken } from "../http";

export interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await http("/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Logout failed",
      };
    }

    const data = await response.json();

    // Clear the access token from memory
    setAccessToken(null);

    return {
      success: true,
      message: data.message || "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);

    // Even if the backend call fails, clear the local token
    setAccessToken(null);

    return {
      success: false,
      error: "Network error during logout, but local session cleared",
    };
  }
}
