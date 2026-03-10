import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Login() {
  useTitle("Login");

  return (
    <Wrapper>
      <Header />
      <Main>Login page</Main>
      <Footer />
    </Wrapper>
  );
}
