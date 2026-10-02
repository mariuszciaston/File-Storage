import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";
import { useAuth } from "../hooks/useAuth";
import { useTitle } from "../hooks/useTitle";

const isDev = import.meta.env.NODE_ENV !== "production";

const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export default function Login() {
  useTitle("Login");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ password: "", username: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:${serverPort}/api/auth/login`,
        {
          body: JSON.stringify(formData),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (response.ok) {
        const data = await response.json();
        login(data.user);
        navigate("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || data.errors?.[0]?.msg || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header />
      <Main>
        <div className="grid place-items-center py-12">
          <section className="w-full max-w-120 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
            <h1 className="m-0 mb-7 text-[1.8rem] font-normal tracking-[-0.04em]">
              Welcome back
            </h1>

            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="mb-4 rounded-[0.65rem] bg-red-100 px-4 py-3 text-[0.85rem] text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <label
                className="mb-4 grid gap-2 text-sm font-medium text-gray-700"
                htmlFor="username"
              >
                Username
                <input
                  autoComplete="username"
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3.5 outline-none focus:border-2 focus:border-blue-600"
                  id="username"
                  name="username"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  type="text"
                  value={formData.username}
                />
              </label>

              <label
                className="mb-4 grid gap-2 text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3.5 outline-none focus:border-2 focus:border-blue-600"
                  id="password"
                  name="password"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  type="password"
                  value={formData.password}
                />
              </label>

              <button
                className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                disabled={loading}
                type="submit"
              >
                {loading ? "Logging In…" : "Login"}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Don't have an account?{" "}
              <Link className="font-semibold text-green-600" to="/register">
                Register here
              </Link>
            </p>
          </section>
        </div>
      </Main>
      <Footer />
    </Wrapper>
  );
}
