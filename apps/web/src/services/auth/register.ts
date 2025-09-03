import { http } from "../../services/http";

export interface RegisterCredentials {
  email: string;
  password: string;
  repeatPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  accessToken?: string;
  user?: {
    id: number;
    email: string;
  };
  error?: string;
}

export async function register(
  credentials: RegisterCredentials
): Promise<RegisterResponse> {
  try {
    const response = await http("/auth/register", {
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
        error: errorData.error || "Registration failed",
      };
    }

    const data = await response.json();

    return {
      success: true,
      accessToken: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
    };
  }
}
