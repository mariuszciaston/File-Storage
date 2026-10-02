import { Box, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const isDev = import.meta.env.DEV;

const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export default function Header({
  onSearchChange,
  searchQuery,
}: {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}) {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [guestLoginError, setGuestLoginError] = useState("");

  const handleGuestLogin = async () => {
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
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-0 bg-gray-50/95 p-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-4 sm:grid-cols-[240px_minmax(0,1fr)_auto]">
        <Link
          className="flex shrink-0 items-center gap-2 text-[1.5rem] font-medium tracking-[-0.04em] text-black"
          to="/"
        >
          <span className="grid size-12 min-w-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
            <Box aria-hidden="true" size={29} />
          </span>
          <span className="whitespace-nowrap">File Storage</span>
        </Link>

        {onSearchChange && (
          <label className="col-span-2 row-start-2 flex h-12 w-full min-w-0 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 text-gray-500 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:max-w-120">
            <Search aria-hidden="true" size={19} />
            <input
              aria-label="Search for files and folders"
              className="min-w-0 flex-1 border-0 bg-transparent outline-none focus:ring-0"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search for files and folders"
              type="text"
              value={searchQuery ?? ""}
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                className="grid size-9.5 shrink-0 place-items-center rounded-full hover:bg-gray-200"
                onClick={() => onSearchChange("")}
                type="button"
              >
                <X size={17} />
              </button>
            )}
          </label>
        )}

        <div className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end sm:col-start-3">
          {user ? (
            <>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-red-700 hover:text-white"
                onClick={logout}
                to="/"
              >
                <span>Logout</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                to="/register"
              >
                <span>Register</span>
              </Link>
              <Link
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                to="/login"
              >
                Login
              </Link>
              <button
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-black hover:text-black"
                onClick={() => handleGuestLogin()}
                type="button"
              >
                Guest
              </button>
            </>
          )}
        </div>
      </div>

      {guestLoginError && (
        <p
          className="absolute top-full right-8 text-xs text-red-700"
          role="alert"
        >
          {guestLoginError}
        </p>
      )}
    </header>
  );
}
