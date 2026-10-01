import { Navigate } from "react-router-dom";

interface AuthRedirectProps {
  children: React.ReactNode;
}

import { useAuth } from "../hooks/useAuth";

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}
