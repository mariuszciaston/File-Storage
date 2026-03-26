import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
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
        const userData = await response.json();
        login(userData);
        navigate("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Login failed");
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
        <div className="bg-cyan-100" id="card">
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                type="text"
                value={formData.username}
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                type="password"
                value={formData.password}
              />
            </div>

            <button disabled={loading} type="submit">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </Main>
      <Footer />
    </Wrapper>
  );
}
