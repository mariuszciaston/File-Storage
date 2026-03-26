import { Link } from "react-router";

import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { logout, user } = useAuth();

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
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              to="/register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
