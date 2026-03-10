import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  useTitle("Dashboard");

  return (
    <Wrapper>
      <Header />
      <Main>Dashboard page</Main>
      <Footer />
    </Wrapper>
  );
}
