import {
  ArrowDownToLine,
  Check,
  ChevronRight,
  FilePlus2,
  Folder,
  Grid2X2,
  List,
  MoreVertical,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DragItem {
  id: number;
  type: "file" | "folder";
}

import type { FileItem, Folder as FolderType } from "../types/types";

import { FileTypeIcon } from "./FileIcons";
import FilePreview from "./FilePreview";
import FolderSidebar from "./FolderSidebar";

interface SearchResponse {
  query: string;
  results: SearchResults;
}
interface SearchResults {
  files: FileItem[];
  folders: FolderType[];
}
type SortKey = "name" | "size" | "updatedAt";

const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const sizeLabel = (size: number) =>
  size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;

const fileIconColorClass = (mimeType: string) =>
  mimeType.startsWith("image/")
    ? "text-green-700"
    : mimeType.startsWith("video/")
      ? "text-amber-700"
      : mimeType.startsWith("audio/")
        ? "text-purple-600"
        : mimeType === "application/pdf"
          ? "text-red-600"
          : "text-gray-500";

export default function FolderView({ searchQuery }: { searchQuery: string }) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderError, setNewFolderError] = useState("");
  const [renamingItem, setRenamingItem] = useState<DragItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showStarred, setShowStarred] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchResults, setSearchResults] = useState<null | SearchResponse>(
    null,
  );
  const [dragOver, setDragOver] = useState<"root" | null | number>(null);
  const [openMenuKey, setOpenMenuKey] = useState<null | string>(null);
  const dragItem = useRef<DragItem | null>(null);
  const parentId = currentFolder?.id ?? null;

  const load = useCallback(async () => {
    const folderUrl =
      parentId != null ? `/api/folders?parentId=${parentId}` : "/api/folders";
    const fileUrl = showStarred
      ? "/api/files?starred=true"
      : parentId != null
        ? `/api/files?folderId=${parentId}`
        : "/api/files";
    const [foldersResponse, filesResponse] = await Promise.all([
      fetch(folderUrl),
      fetch(fileUrl),
    ]);
    if (foldersResponse.ok) setFolders(await foldersResponse.json());
    if (filesResponse.ok) setFiles(await filesResponse.json());
  }, [parentId, showStarred]);

  useEffect(() => {
    async function fetchItems() {
      const folderUrl =
        parentId != null ? `/api/folders?parentId=${parentId}` : "/api/folders";
      const fileUrl = showStarred
        ? "/api/files?starred=true"
        : parentId != null
          ? `/api/files?folderId=${parentId}`
          : "/api/files";
      const [foldersResponse, filesResponse] = await Promise.all([
        fetch(folderUrl),
        fetch(fileUrl),
      ]);
      if (foldersResponse.ok) setFolders(await foldersResponse.json());
      if (filesResponse.ok) setFiles(await filesResponse.json());
    }
    void fetchItems();
  }, [parentId, showStarred]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        const results = response.ok
          ? ((await response.json()) as SearchResults)
          : { files: [], folders: [] };
        if (active) setSearchResults({ query, results });
      } catch {
        if (active) {
          setSearchResults({ query, results: { files: [], folders: [] } });
        }
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((ascending) => !ascending);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sortedFolders = [...folders]
    .filter((folder) => !showStarred || folder.starred)
    .sort((a, b) => a.name.localeCompare(b.name) * (sortAsc ? 1 : -1));
  const sortedFiles = [...files]
    .filter((file) => !showStarred || file.starred)
    .sort((a, b) => {
      const direction = sortAsc ? 1 : -1;
      if (sortKey === "size") return (a.size - b.size) * direction;
      if (sortKey === "updatedAt") {
        return (Date.parse(a.updatedAt) - Date.parse(b.updatedAt)) * direction;
      }
      return a.name.localeCompare(b.name) * direction;
    });
  const activeSearchResults =
    searchResults?.query === searchQuery.trim() ? searchResults.results : null;
  const visibleFolders = activeSearchResults?.folders ?? sortedFolders;
  const visibleFiles = activeSearchResults?.files ?? sortedFiles;
  const isSearchPending = Boolean(searchQuery.trim() && !activeSearchResults);
  const hasItems = visibleFolders.length + visibleFiles.length > 0;

  async function createFolder() {
    if (!newFolderName.trim()) {
      setNewFolderError("Folder name cannot be empty");
      return;
    }
    const response = await fetch("/api/folders", {
      body: JSON.stringify({ name: newFolderName.trim(), parentId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (response.ok) {
      setNewFolderName("");
      setNewFolderError("");
      setShowNewFolderModal(false);
      await load();
    } else {
      const data = await response.json();
      setNewFolderError(data.errors?.[0]?.msg ?? "Could not create folder");
    }
  }

  async function renameItem() {
    if (!renamingItem || !renameValue.trim()) {
      setRenameError("Name cannot be empty");
      return;
    }
    const endpoint = renamingItem.type === "folder" ? "folders" : "files";
    const response = await fetch(`/api/${endpoint}/${renamingItem.id}`, {
      body: JSON.stringify({ name: renameValue.trim() }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (response.ok) {
      setRenamingItem(null);
      setRenameError("");
      await load();
    } else {
      const data = await response.json();
      setRenameError(data.errors?.[0]?.msg ?? "Could not rename item");
    }
  }

  async function deleteFolder(folder: FolderType) {
    if (!confirm(`Delete “${folder.name}” and all its contents?`)) return;
    const response = await fetch(`/api/folders/${folder.id}`, {
      method: "DELETE",
    });
    if (response.ok) await load();
  }

  async function deleteFile(file: FileItem) {
    if (!confirm(`Delete “${file.name}”?`)) return;
    const response = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  async function toggleStar(
    item: FileItem | FolderType,
    type: DragItem["type"],
  ) {
    const endpoint = type === "folder" ? "folders" : "files";
    const response = await fetch(`/api/${endpoint}/${item.id}/star`, {
      method: "PATCH",
    });
    if (!response.ok) return;
    const updated = await response.json();
    if (type === "folder") {
      setFolders((previous) =>
        previous.map((folder) =>
          folder.id === item.id
            ? { ...folder, starred: updated.starred }
            : folder,
        ),
      );
    } else {
      setFiles((previous) =>
        previous.map((file) =>
          file.id === item.id ? { ...file, starred: updated.starred } : file,
        ),
      );
    }
  }

  async function handleDrop(targetFolderId: null | number) {
    const item = dragItem.current;
    if (!item || item.id === targetFolderId) return;
    const endpoint = item.type === "folder" ? "folders" : "files";
    const payload =
      item.type === "folder"
        ? { parentId: targetFolderId }
        : { folderId: targetFolderId };
    const response = await fetch(`/api/${endpoint}/${item.id}/move`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (response.ok) await load();
    dragItem.current = null;
    setDragOver(null);
  }

  function navigateTo(index: number) {
    const path = index < 0 ? [] : breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(path);
    setCurrentFolder(path.at(-1) ?? null);
  }

  function openFolder(folder: FolderType) {
    setBreadcrumbs((previous) => [...previous, folder]);
    setCurrentFolder(folder);
  }

  function beginRename(item: DragItem, name: string) {
    setRenamingItem(item);
    setRenameValue(name);
    setRenameError("");
  }

  function clearRename() {
    setRenamingItem(null);
    setRenameError("");
  }

  function renderFolderActions(folder: FolderType) {
    return (
      <ItemActions
        downloadUrl={`/api/folders/${folder.id}/download`}
        menuOpen={openMenuKey === `folder-${folder.id}`}
        onCloseMenu={() => setOpenMenuKey(null)}
        onDelete={() => void deleteFolder(folder)}
        onRename={() =>
          beginRename({ id: folder.id, type: "folder" }, folder.name)
        }
        onToggleMenu={() =>
          setOpenMenuKey((key) =>
            key === `folder-${folder.id}` ? null : `folder-${folder.id}`,
          )
        }
        onToggleStar={() => void toggleStar(folder, "folder")}
        starred={folder.starred}
      />
    );
  }

  function renderFileActions(file: FileItem) {
    return (
      <ItemActions
        downloadUrl={`/api/files/${file.id}/download`}
        menuOpen={openMenuKey === `file-${file.id}`}
        onCloseMenu={() => setOpenMenuKey(null)}
        onDelete={() => void deleteFile(file)}
        onRename={() => beginRename({ id: file.id, type: "file" }, file.name)}
        onToggleMenu={() =>
          setOpenMenuKey((key) =>
            key === `file-${file.id}` ? null : `file-${file.id}`,
          )
        }
        onToggleStar={() => void toggleStar(file, "file")}
        starred={file.starred}
      />
    );
  }

  function renderFolder(folder: FolderType) {
    const isRenaming =
      renamingItem?.type === "folder" && renamingItem.id === folder.id;
    return (
      <article
        className={`relative min-w-0 overflow-visible rounded-[0.9rem] border border-gray-200 bg-white p-3 transition-colors hover:outline-2 hover:outline-blue-600 ${!isRenaming ? "cursor-pointer" : ""} ${dragOver === folder.id ? "bg-blue-50 outline-2 outline-blue-600" : ""}`}
        draggable
        key={`folder-${folder.id}`}
        onClick={() => {
          if (!isRenaming) openFolder(folder);
        }}
        onDragEnd={() => {
          dragItem.current = null;
          setDragOver(null);
        }}
        onDragLeave={() => setDragOver(null)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(folder.id);
        }}
        onDragStart={() => {
          dragItem.current = { id: folder.id, type: "folder" };
        }}
        onDrop={(event) => {
          event.preventDefault();
          void handleDrop(folder.id);
        }}
      >
        {isRenaming ? (
          <RenameField
            error={renameError}
            onCancel={clearRename}
            onChange={(value) => {
              setRenameValue(value);
              setRenameError("");
            }}
            onSave={() => void renameItem()}
            value={renameValue}
          />
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10.5 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-500">
                  <Folder size={22} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <button
                    className="block max-w-full cursor-pointer overflow-hidden bg-transparent text-[0.88rem] font-medium text-ellipsis whitespace-nowrap text-gray-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      openFolder(folder);
                    }}
                    title={folder.name}
                  >
                    {folder.name}
                  </button>
                </div>
              </div>
              {renderFolderActions(folder)}
            </div>
          </>
        )}
      </article>
    );
  }

  function renderFile(file: FileItem) {
    const isRenaming =
      renamingItem?.type === "file" && renamingItem.id === file.id;
    const iconTone = file.mimeType.startsWith("image/")
      ? "image"
      : file.mimeType.startsWith("video/")
        ? "video"
        : file.mimeType.startsWith("audio/")
          ? "audio"
          : file.mimeType === "application/pdf"
            ? "pdf"
            : "";
    return (
      <article
        className={`relative flex h-full min-w-0 flex-col gap-2 overflow-visible rounded-[0.9rem] border border-gray-200 bg-white p-3 transition-colors hover:outline-2 hover:outline-blue-600 ${!isRenaming ? "cursor-pointer" : ""}`}
        draggable
        key={`file-${file.id}`}
        onClick={() => {
          if (!isRenaming) setPreviewFile(file);
        }}
        onDragEnd={() => {
          dragItem.current = null;
          setDragOver(null);
        }}
        onDragStart={() => {
          dragItem.current = { id: file.id, type: "file" };
        }}
      >
        {isRenaming ? (
          <RenameField
            error={renameError}
            onCancel={clearRename}
            onChange={(value) => {
              setRenameValue(value);
              setRenameError("");
            }}
            onSave={() => void renameItem()}
            value={renameValue}
          />
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`grid size-10.5 shrink-0 place-items-center rounded-xl ${iconTone === "image" ? "bg-green-100 text-green-700" : iconTone === "pdf" ? "bg-red-100 text-red-600" : iconTone === "audio" ? "bg-purple-100 text-purple-600" : iconTone === "video" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
                >
                  <FileTypeIcon mimeType={file.mimeType} size={21} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <button
                    className="block max-w-full cursor-pointer overflow-hidden bg-transparent text-[0.88rem] font-medium text-ellipsis whitespace-nowrap text-gray-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPreviewFile(file);
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </button>
                </div>
              </div>
              {renderFileActions(file)}
            </div>
            {file.mimeType.startsWith("image/") ? (
              <button
                aria-label={`Preview ${file.name}`}
                className="block h-27.5 w-full cursor-pointer rounded-[0.6rem] border border-gray-200 bg-white p-0"
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewFile(file);
                }}
              >
                <img
                  alt=""
                  className="h-full w-full rounded-[0.6rem] object-contain"
                  loading="lazy"
                  src={`/api/files/${file.id}/preview`}
                />
              </button>
            ) : (
              <div className="grid h-27.5 w-full place-items-center rounded-[0.6rem] border border-gray-200 bg-white text-gray-500">
                <FileTypeIcon mimeType={file.mimeType} size={32} />
              </div>
            )}
          </>
        )}
      </article>
    );
  }

  return (
    <section className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(540px,1fr)] items-stretch gap-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:grid-rows-1">
      <FolderSidebar
        folderId={parentId ?? undefined}
        onNewFolder={() => setShowNewFolderModal(true)}
        onShowStarredChange={setShowStarred}
        onUploaded={() => void load()}
        showStarred={showStarred}
      />

      <div className="h-full min-h-135 min-w-0 rounded-[1.25rem] bg-white p-4 sm:p-7">
        <div className="min-h-10.5tems-center mb-5 flex justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-1 text-gray-500"
          >
            <button
              className={`-ml-2 max-w-55 overflow-hidden rounded-lg bg-transparent px-2 py-1 text-ellipsis whitespace-nowrap hover:bg-gray-100 ${breadcrumbs.length === 0 ? "text-xl font-medium text-gray-900" : ""} ${dragOver === "root" ? "outline-2 outline-blue-600" : ""}`}
              onClick={() => navigateTo(-1)}
              onDragLeave={() => setDragOver(null)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver("root");
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(null);
              }}
            >
              My Drive
            </button>
            {breadcrumbs.map((breadcrumb, index) => (
              <span className="flex items-center gap-1" key={breadcrumb.id}>
                <ChevronRight aria-hidden="true" size={16} />
                <button
                  className={`max-w-55 overflow-hidden rounded-lg bg-transparent px-2 py-1 text-ellipsis whitespace-nowrap hover:bg-gray-100 ${index === breadcrumbs.length - 1 ? "text-xl font-medium text-gray-900" : ""}`}
                  onClick={() => navigateTo(index)}
                >
                  {breadcrumb.name}
                </button>
              </span>
            ))}
          </nav>
          <div
            aria-label="View mode"
            className="flex gap-0 rounded-full border border-gray-200 p-0.75"
          >
            <button
              aria-label="Grid view"
              className={`grid size-9 place-items-center rounded-full text-gray-500 ${view === "grid" ? "bg-blue-100 text-blue-800" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              <Grid2X2 size={17} />
            </button>
            <button
              aria-label="List view"
              className={`grid size-9 place-items-center rounded-full text-gray-500 ${view === "list" ? "bg-blue-100 text-blue-800" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {isSearchPending ? (
          <div className="grid min-h-85 place-items-center p-8 text-center text-gray-500">
            <p className="text-sm">Searching…</p>
          </div>
        ) : searchQuery.trim() && activeSearchResults && !hasItems ? (
          <div className="grid min-h-85 place-items-center p-8 text-center text-gray-500">
            <div>
              <div className="mx-auto mb-4 grid size-19 place-items-center rounded-full bg-gray-100">
                <Search size={30} />
              </div>
              <h2 className="mb-1 text-base font-medium text-gray-700">
                No matches found
              </h2>
              <p className="text-sm">Try another name or search term.</p>
            </div>
          </div>
        ) : hasItems ? (
          view === "grid" ? (
            <>
              {visibleFolders.length > 0 && (
                <>
                  <h2 className="mt-6 mb-3 text-sm font-semibold text-gray-700">
                    Folders
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
                    {visibleFolders.map(renderFolder)}
                  </div>
                </>
              )}
              {visibleFiles.length > 0 && (
                <>
                  <h2 className="mt-6 mb-3 text-sm font-semibold text-gray-700">
                    Files
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
                    {visibleFiles.map(renderFile)}
                  </div>
                </>
              )}
            </>
          ) : (
            <table className="w-full border-collapse text-[0.86rem]">
              <thead>
                <tr className="text-left">
                  {(["name", "size", "updatedAt"] as const).map((key) => (
                    <th
                      className="border-b border-gray-200 px-3 py-2.5 text-xs font-medium whitespace-nowrap text-gray-500"
                      key={key}
                    >
                      <button className="p-0" onClick={() => toggleSort(key)}>
                        {key === "name"
                          ? "Name"
                          : key === "size"
                            ? "File size"
                            : "Last modified"}
                        {sortKey === key ? (sortAsc ? " ↑" : " ↓") : ""}
                      </button>
                    </th>
                  ))}
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleFolders.map((folder) => (
                  <tr key={`row-folder-${folder.id}`}>
                    <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                      {renamingItem?.type === "folder" &&
                      renamingItem.id === folder.id ? (
                        <RenameField
                          error={renameError}
                          onCancel={clearRename}
                          onChange={(value) => {
                            setRenameValue(value);
                            setRenameError("");
                          }}
                          onSave={() => void renameItem()}
                          value={renameValue}
                        />
                      ) : (
                        <button
                          className="inline-flex max-w-90 items-center gap-3 overflow-hidden text-left text-gray-700"
                          onClick={() => openFolder(folder)}
                        >
                          <Folder className="text-blue-500" size={19} />
                          <span className="overflow-hidden text-ellipsis">
                            {folder.name}
                          </span>
                        </button>
                      )}
                    </td>
                    <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                      —
                    </td>
                    <td className="h-13.5order-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                      {dateLabel(folder.updatedAt)}
                    </td>
                    <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                      {renderFolderActions(folder)}
                    </td>
                  </tr>
                ))}
                {visibleFiles.map((file) => {
                  return (
                    <tr key={`row-file-${file.id}`}>
                      <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                        {renamingItem?.type === "file" &&
                        renamingItem.id === file.id ? (
                          <RenameField
                            error={renameError}
                            onCancel={clearRename}
                            onChange={(value) => {
                              setRenameValue(value);
                              setRenameError("");
                            }}
                            onSave={() => void renameItem()}
                            value={renameValue}
                          />
                        ) : (
                          <button
                            className="inline-flex max-w-90 items-center gap-3 overflow-hidden text-left text-gray-700"
                            onClick={() => setPreviewFile(file)}
                          >
                            <span className={fileIconColorClass(file.mimeType)}>
                              <FileTypeIcon
                                mimeType={file.mimeType}
                                size={19}
                              />
                            </span>
                            <span className="overflow-hidden text-ellipsis">
                              {file.name}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                        {sizeLabel(file.size)}
                      </td>
                      <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                        {dateLabel(file.updatedAt)}
                      </td>
                      <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                        {renderFileActions(file)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          <div className="grid min-h-85 place-items-center p-8 text-center text-gray-500">
            <div>
              <div className="mx-auto mb-4 grid size-19 place-items-center rounded-full bg-gray-100">
                <FilePlus2 size={32} />
              </div>
              <h2 className="mb-1 text-base font-medium text-gray-700">
                {showStarred ? "Nothing starred yet" : "Your space is ready"}
              </h2>
              <p className="text-sm">
                {showStarred
                  ? "Star files and folders to find them here."
                  : "Create a folder or upload a file to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {showNewFolderModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-gray-900/40 p-4 backdrop-blur-sm"
          onClick={() => {
            setShowNewFolderModal(false);
            setNewFolderError("");
          }}
        >
          <section
            aria-labelledby="new-folder-title"
            aria-modal="true"
            className="w-full max-w-110 rounded-3xl border border-gray-200 bg-white p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="mb-5 text-xl font-medium" id="new-folder-title">
              Create a folder
            </h2>
            <label
              className="mb-4 grid gap-2 text-sm font-medium text-gray-700"
              htmlFor="new-folder-name"
            >
              Folder name
              <input
                autoFocus
                className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3.5 outline-none focus:border-2 focus:border-blue-600"
                id="new-folder-name"
                onChange={(event) => {
                  setNewFolderName(event.target.value);
                  setNewFolderError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void createFolder();
                  if (event.key === "Escape") setShowNewFolderModal(false);
                }}
                placeholder="For example, Projects"
                value={newFolderName}
              />
            </label>
            {newFolderError && (
              <p className="text-xs text-red-700">{newFolderError}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderError("");
                }}
              >
                Cancel
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => void createFolder()}
              >
                Create
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function ItemActions({
  downloadUrl,
  menuOpen,
  onCloseMenu,
  onDelete,
  onRename,
  onToggleMenu,
  onToggleStar,
  starred,
}: {
  downloadUrl: string;
  menuOpen: boolean;
  onCloseMenu: () => void;
  onDelete: () => void;
  onRename: () => void;
  onToggleMenu: () => void;
  onToggleStar: () => void;
  starred: boolean;
}) {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) onCloseMenu();
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [menuOpen, onCloseMenu]);

  return (
    <div
      className="relative shrink-0"
      onClick={(event) => event.stopPropagation()}
      ref={actionsRef}
    >
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Open file actions"
        className="grid size-8 place-items-center rounded-full text-gray-700 hover:bg-gray-200"
        onClick={onToggleMenu}
        title="Actions"
      >
        <MoreVertical size={20} />
      </button>
      {menuOpen && (
        <div
          className="absolute top-9 right-0 z-50 min-w-40 rounded-lg border border-gray-200 bg-white p-1 text-sm text-gray-700"
          role="menu"
        >
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              onCloseMenu();
              onRename();
            }}
            role="menuitem"
          >
            <Pencil size={16} /> Rename
          </button>
          <a
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
            download
            href={downloadUrl}
            onClick={onCloseMenu}
            role="menuitem"
          >
            <ArrowDownToLine size={16} /> Download
          </a>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              onCloseMenu();
              onToggleStar();
            }}
            role="menuitem"
          >
            <Star fill={starred ? "currentColor" : "none"} size={16} />
            {starred ? "Remove star" : "Add star"}
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-red-700 hover:bg-red-100"
            onClick={() => {
              onCloseMenu();
              onDelete();
            }}
            role="menuitem"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function RenameField({
  error,
  onCancel,
  onChange,
  onSave,
  value,
}: {
  error: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  value: string;
}) {
  return (
    <div className="relative flex min-w-0 items-center gap-px">
      <input
        aria-label="New name"
        autoFocus
        className="h-9 w-full min-w-0 rounded-md border border-gray-300 px-2 outline-blue-600"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSave();
          if (event.key === "Escape") onCancel();
        }}
        value={value}
      />
      <button
        aria-label="Save name"
        className="grid size-8 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
        onClick={onSave}
      >
        <Check size={17} />
      </button>
      <button
        aria-label="Cancel rename"
        className="grid size-8 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
        onClick={onCancel}
      >
        <X size={17} />
      </button>
      {error && (
        <span className="absolute bottom-0 left-3 text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}
