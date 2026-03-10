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
      <Main>Register page</Main>
      <Footer />
    </Wrapper>
  );
}
