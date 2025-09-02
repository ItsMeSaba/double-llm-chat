import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../service/http";
import { useAuth } from "../base/context/AuthProvider";

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
