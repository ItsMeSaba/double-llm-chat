import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../service/http";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
