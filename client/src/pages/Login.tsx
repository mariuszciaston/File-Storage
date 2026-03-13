import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

const isDev = import.meta.env.NODE_ENV !== "production";

const serverPort = isDev
  ? (import.meta.env.VITE_SERVER_DEV_PORT ?? 8080)
  : (import.meta.env.VITE_SERVER_PROD_PORT ?? 8081);

export default function Login() {
  useTitle("Login");

  return (
    <Wrapper>
      <Header />
      <Main>
        <div className="bg-cyan-100" id="card">
          <form action={`http://localhost:${serverPort}/login`} method="POST">
            <div>
              <label htmlFor="username">Username</label>
              <input id="username" name="username" required type="text" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" required type="password" />
            </div>

            <button type="submit">Log In</button>
          </form>

          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </Main>
      <Footer />
    </Wrapper>
  );
}
