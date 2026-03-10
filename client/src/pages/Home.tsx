import { Link } from "react-router";

import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Home() {
  useTitle("Home");

  return (
    <Wrapper>
      <Header />
      <Main>
        Home page
        <Link to="/register">Join now!</Link>
        <span>
          Already have an account? <Link to="/login">Log In here</Link>
        </span>
      </Main>
      <Footer />
    </Wrapper>
  );
}
