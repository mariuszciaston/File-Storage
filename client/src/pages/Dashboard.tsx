import { useState } from "react";

import FolderSidebar from "../components/FolderSidebar";
import FolderView from "../components/FolderView";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  useTitle("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [folderId, setFolderId] = useState<number | undefined>();
  const [showStarred, setShowStarred] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newFolderRequest, setNewFolderRequest] = useState(0);

  return (
    <Wrapper>
      <Header onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      <Main>
        <FolderSidebar
          folderId={folderId}
          onNewFolder={() => setNewFolderRequest((request) => request + 1)}
          onShowStarredChange={setShowStarred}
          onUploaded={() => setRefreshKey((key) => key + 1)}
          showStarred={showStarred}
        />
        <FolderView
          newFolderRequest={newFolderRequest}
          onFolderChange={setFolderId}
          onSearchChange={setSearchQuery}
          refreshKey={refreshKey}
          searchQuery={searchQuery}
          showStarred={showStarred}
        />
      </Main>
      <Footer />
    </Wrapper>
  );
}
