import { useEffect, useMemo, useState } from "react";

import type { User } from "../types/types";

import { AuthContext } from "./AuthContext";

const isDev = import.meta.env.NODE_ENV !== "production";
const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        `http://localhost:${serverPort}/api/auth/me`,
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`http://localhost:${serverPort}/api/auth/logout`, {
        credentials: "include",
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const contextValue = useMemo(
    () => ({ loading, login, logout, user }),
    [loading, user],
  );

  return <AuthContext value={contextValue}>{children}</AuthContext>;
}
