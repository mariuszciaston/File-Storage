import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Register() {
  useTitle("Register");

  return (
    <Wrapper>
      <Header />
      <Main>
        <div className="bg-green-100" id="card">
          <form action="/register" method="POST">
            <div>
              <label htmlFor="fullname">Full Name</label>
              <input id="fullname" name="fullname" required type="text" />
            </div>

            <div>
              <label htmlFor="username">Username</label>
              <input id="username" name="username" required type="text" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" required type="password" />
            </div>

            <div>
              <label htmlFor="passwordConfirmation">Confirm Password</label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                required
                type="password"
              />
            </div>

            <button type="submit">Create Account</button>
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
