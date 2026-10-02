import { useState } from "react";

import FolderView from "../components/FolderView";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  useTitle("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Wrapper>
      <Header onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      <Main>
        <FolderView onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      </Main>
      <Footer />
    </Wrapper>
  );
}
