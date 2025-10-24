import { useAuth } from "../../base/context/AuthProvider";
import { validateForm } from "./helpers/validate-form";
import { login, register } from "../../services/auth";
import { setAccessToken } from "../../services/http";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { to } from "@/base/utils/to";
import { useState } from "react";
import "./styles.scss";

export interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { isAuthed, loading: isAuthLoading } = useAuth();
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, setErrors, isLogin)) {
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    const action = isLogin ? login : register;

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          password: formData.password,
          repeatPassword: formData.confirmPassword!,
        };

    const fallbackMsg = isLogin ? "Login failed" : "Registration failed";

    const result = await to(() => action(payload as any));

    if (!result.ok) {
      setErrors([String(result.error) || fallbackMsg]);
      setIsLoading(false);
      return;
    }

    const { success, accessToken, error } = result.data;

    if (success && accessToken) {
      setAccessToken(accessToken);
      navigate("/dual-chat");
    } else {
      setErrors([error ?? fallbackMsg]);
    }

    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", confirmPassword: "" });
    setErrors([]);
  };

  if (isAuthLoading) return "Loading...";

  if (isAuthed) return <Navigate to="/dual-chat" replace />;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>

        <p className="subtitle">
          {isLogin ? "Sign in to your account" : "Sign up for a new account"}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <p key={index} className="error-message">
                  {error}
                </p>
              ))}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading
              ? isLogin
                ? "Signing In..."
                : "Creating Account..."
              : isLogin
                ? "Sign In"
                : "Sign Up"}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}

            <button
              type="button"
              onClick={toggleMode}
              className="toggle-btn"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
