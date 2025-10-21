import { useAuth } from "../base/context/AuthProvider";
import { getAccessToken } from "../services/http";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = getAccessToken();
  const { loading } = useAuth();

  if (loading) return "Loading...";

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
