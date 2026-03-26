import { Navigate } from "react-router-dom";

import type { ProtectedRouteProps } from "../types/types";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate replace to="/" />;
  }

  return <>{children}</>;
}
