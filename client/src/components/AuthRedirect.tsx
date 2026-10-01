import { Navigate } from "react-router-dom";

interface AuthRedirectProps {
  children: React.ReactNode;
}

import { useAuth } from "../hooks/useAuth";

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const {
    // loading,
    user,
  } = useAuth();

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}
