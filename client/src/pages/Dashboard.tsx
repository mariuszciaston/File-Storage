import { useState } from "react";

import FolderView from "../components/FolderView";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import Wrapper from "../components/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  useTitle("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Wrapper>
      <Header onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      <Main>
        <FolderView searchQuery={searchQuery} />
      </Main>
      <Footer />
    </Wrapper>
  );
}
