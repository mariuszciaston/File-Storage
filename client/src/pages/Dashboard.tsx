import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useAuth } from "../hooks/useAuth";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  useTitle("Dashboard");
  const { user } = useAuth();

  return (
    <Wrapper>
      <Header />
      <Main>
        <h1>Hello {user?.fullname}!</h1>
        <br />
        <p>Dashboard page</p>
      </Main>
      <Footer />
    </Wrapper>
  );
}
