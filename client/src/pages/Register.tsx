import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

const isDev = import.meta.env.NODE_ENV !== "production";

const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export default function Register() {
  useTitle("Register");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    password: "",
    passwordConfirmation: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:${serverPort}/api/auth/register`,
        {
          body: JSON.stringify(formData),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      if (response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Wrapper>
      <Header />
      <Main>
        <div className="bg-green-100" id="card">
          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div>
              <label htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                name="fullname"
                onChange={handleChange}
                required
                type="text"
                value={formData.fullname}
              />
            </div>

            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                onChange={handleChange}
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
                onChange={handleChange}
                required
                type="password"
                value={formData.password}
              />
            </div>

            <div>
              <label htmlFor="passwordConfirmation">Confirm Password</label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                onChange={handleChange}
                required
                type="password"
                value={formData.passwordConfirmation}
              />
            </div>

            <button disabled={loading} type="submit">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account? <a href="/login">Log In here</a>
          </p>
        </div>
      </Main>
      <Footer />
    </Wrapper>
  );
}
