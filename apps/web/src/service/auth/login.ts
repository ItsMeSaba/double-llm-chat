import { http } from "../http";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  user?: {
    id: number;
    email: string;
  };
  error?: string;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await http("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Login failed",
      };
    }

    const data = await response.json();

    return {
      success: true,
      accessToken: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
    };
  }
}
