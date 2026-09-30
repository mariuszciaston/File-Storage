import { Folder, FolderPlus, Star } from "lucide-react";

import FileUploader from "./FileUploader";

interface FolderSidebarProps {
  folderId?: number;
  onNewFolder: () => void;
  onShowStarredChange: (showStarred: boolean) => void;
  onUploaded: () => void;
  showStarred: boolean;
}

export default function FolderSidebar({
  folderId,
  onNewFolder,
  onShowStarredChange,
  onUploaded,
  showStarred,
}: FolderSidebarProps) {
  return (
    <aside
      aria-label="Storage navigation"
      className="flex flex-col gap-2 sm:sticky sm:top-24 sm:self-start"
    >
      <button
        className="mb-2 inline-flex min-h-14 cursor-pointer items-center gap-3 self-start rounded-2xl border border-gray-200 bg-white px-5 font-semibold text-gray-700 transition hover:outline-2 hover:outline-blue-600"
        onClick={onNewFolder}
      >
        <FolderPlus size={20} /> New folder
      </button>
      <FileUploader folderId={folderId} onUploaded={onUploaded} />
      <div className="mx-4 my-2 h-px bg-gray-200" />
      <button
        className={`inline-flex min-h-11 items-center justify-start gap-2 rounded-r-full px-4 text-sm font-medium text-gray-500 hover:bg-gray-100 ${!showStarred ? "bg-blue-100" : ""}`}
        onClick={() => onShowStarredChange(false)}
      >
        <Folder size={18} /> My Drive
      </button>
      <button
        className={`inline-flex min-h-11 items-center justify-start gap-2 rounded-r-full px-4 text-sm font-medium text-gray-500 hover:bg-gray-100 ${showStarred ? "bg-blue-100" : ""}`}
        onClick={() => onShowStarredChange(true)}
      >
        <Star size={18} /> Starred
      </button>
    </aside>
  );
}
