import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const isDev = import.meta.env.NODE_ENV !== "production";
const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export default function Header() {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [guestLoginLoading, setGuestLoginLoading] = useState(false);
  const [guestLoginError, setGuestLoginError] = useState("");

  const handleGuestLogin = async () => {
    setGuestLoginLoading(true);
    setGuestLoginError("");

    try {
      const response = await fetch(
        `http://localhost:${serverPort}/api/auth/login`,
        {
          body: JSON.stringify({ password: "123", username: "guest" }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      const data = await response.json();
      if (response.ok) {
        login(data.user);
        navigate("/dashboard");
      } else {
        setGuestLoginError(data.error || "Guest login failed");
      }
    } catch {
      setGuestLoginError("Network error. Please try again.");
    } finally {
      setGuestLoginLoading(false);
    }
  };

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 bg-amber-100 p-4 sm:gap-8 sm:p-8">
      <Link to="/">
        <div className="flex flex-wrap items-center gap-2" id="logo">
          <img
            alt="folder icon"
            className="h-8 w-auto"
            src="/android-chrome-192x192.png"
          />
          <span className="text-2xl font-bold whitespace-nowrap">
            File Storage
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <Link
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={logout}
            to="/"
          >
            Logout
          </Link>
        ) : (
          <>
            <Link
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              to="/register"
            >
              Register
            </Link>
            <Link
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              to="/login"
            >
              Login
            </Link>
            <button
              className="rounded bg-cyan-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={guestLoginLoading}
              onClick={() => handleGuestLogin()}
              type="button"
            >
              {guestLoginLoading ? "Logging in..." : "Guest"}
            </button>
          </>
        )}
      </div>
      {guestLoginError && (
        <p className="w-full text-right text-sm text-red-700" role="alert">
          {guestLoginError}
        </p>
      )}
    </header>
  );
}
