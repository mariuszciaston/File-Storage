import { useState } from "react";

import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Main from "../components/layouts/Main";
import Wrapper from "../components/layouts/Wrapper";
import FolderSidebar from "../components/sidebar/FolderSidebar";
import FolderView from "../components/view/FolderView";
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
        <div className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(540px,1fr)] items-stretch gap-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:grid-rows-1">
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
        </div>
      </Main>
      <Footer />
    </Wrapper>
  );
}
