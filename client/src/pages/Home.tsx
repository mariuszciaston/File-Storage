import { Link } from "react-router";

import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";

export default function App() {
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
