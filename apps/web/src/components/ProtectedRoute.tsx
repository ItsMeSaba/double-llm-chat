import { useAuth } from "../base/context/AuthProvider";
import { getAccessToken } from "../services/http";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const accessToken = getAccessToken();
  const { loading } = useAuth();

  if (loading) return "Loading...";

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
