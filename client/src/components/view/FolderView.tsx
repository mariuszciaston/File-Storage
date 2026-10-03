import {
  ArrowDownToLine,
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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DragItem {
  id: number;
  type: "file" | "folder";
}

import type { FileItem, Folder as FolderType } from "../../types/types";

import { FileTypeIcon } from "../common/FileIcons";
import ModalDialog from "../common/ModalDialog";
import FilePreview from "./FilePreview";

interface FolderBreadcrumb {
  id: number;
  name: string;
}
type ModalAction =
  | { item: DragItem; kind: "delete"; name: string }
  | { item: DragItem; kind: "rename"; name: string }
  | { kind: "new-folder" };
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

export default function FolderView({
  newFolderRequest,
  onFolderChange,
  onSearchChange,
  refreshKey,
  searchQuery,
  showStarred,
}: {
  newFolderRequest: number;
  onFolderChange: (folderId: number | undefined) => void;
  onSearchChange: (query: string) => void;
  refreshKey: number;
  searchQuery: string;
  showStarred: boolean;
}) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderBreadcrumb | null>(
    null,
  );
  const [breadcrumbs, setBreadcrumbs] = useState<FolderBreadcrumb[]>([]);
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalPending, setModalPending] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
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
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    onFolderChange(parentId ?? undefined);
  }, [onFolderChange, parentId]);

  useEffect(() => {
    if (newFolderRequest > 0) openNewFolderModal();
  }, [newFolderRequest]);

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
      setSortAsc(key !== "updatedAt");
    }
  }

  const activeSearchResults =
    searchResults?.query === searchQuery.trim() ? searchResults.results : null;
  const direction = sortAsc ? 1 : -1;
  const compareUpdatedAt = (
    a: { name: string; updatedAt: string },
    b: { name: string; updatedAt: string },
  ) => {
    const dateDifference = Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
    return (
      (Number.isNaN(dateDifference) ? 0 : dateDifference) ||
      a.name.localeCompare(b.name)
    );
  };
  const sortedFolders = [...(activeSearchResults?.folders ?? folders)]
    .filter((folder) => activeSearchResults || !showStarred || folder.starred)
    .sort((a, b) => {
      const comparison =
        sortKey === "updatedAt"
          ? compareUpdatedAt(a, b)
          : a.name.localeCompare(b.name);
      return comparison * direction;
    });
  const sortedFiles = [...(activeSearchResults?.files ?? files)]
    .filter((file) => activeSearchResults || !showStarred || file.starred)
    .sort((a, b) => {
      const comparison =
        sortKey === "size"
          ? a.size - b.size
          : sortKey === "updatedAt"
            ? compareUpdatedAt(a, b)
            : a.name.localeCompare(b.name);
      return comparison * direction;
    });
  const visibleFolders = sortedFolders;
  const visibleFiles = sortedFiles;
  const isSearchPending = Boolean(searchQuery.trim() && !activeSearchResults);
  const hasItems = visibleFolders.length + visibleFiles.length > 0;

  function openNewFolderModal() {
    setModalAction({ kind: "new-folder" });
    setModalValue("");
    setModalError("");
  }

  function openRenameModal(item: DragItem, name: string) {
    setModalAction({ item, kind: "rename", name });
    setModalValue(name);
    setModalError("");
  }

  function openDeleteModal(item: DragItem, name: string) {
    setModalAction({ item, kind: "delete", name });
    setModalValue("");
    setModalError("");
  }

  function closeActionModal() {
    if (modalPending) return;
    setModalAction(null);
    setModalError("");
  }

  async function submitActionModal() {
    if (!modalAction) return;
    const needsName = modalAction.kind !== "delete";
    const name = modalValue.trim();
    if (needsName && !name) {
      setModalError("Name cannot be empty");
      return;
    }

    let url = "/api/folders";
    let method = "POST";
    let body: string | undefined;
    if (modalAction.kind === "new-folder") {
      body = JSON.stringify({ name, parentId });
    } else {
      const endpoint = modalAction.item.type === "folder" ? "folders" : "files";
      url = `/api/${endpoint}/${modalAction.item.id}`;
      method = modalAction.kind === "rename" ? "PATCH" : "DELETE";
      if (modalAction.kind === "rename") body = JSON.stringify({ name });
    }

    setModalPending(true);
    try {
      const response = await fetch(url, {
        ...(body
          ? { body, headers: { "Content-Type": "application/json" } }
          : {}),
        method,
      });
      if (!response.ok) {
        const data = await response.json();
        setModalError(
          data.errors?.[0]?.msg ??
            data.error ??
            `Could not ${modalAction.kind === "new-folder" ? "create folder" : modalAction.kind === "rename" ? "rename item" : "delete item"}`,
        );
        return;
      }
      setModalAction(null);
      setModalError("");
      await load();
    } catch {
      setModalError("The request failed. Please try again.");
    } finally {
      setModalPending(false);
    }
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
    if (!item || (item.type === "folder" && item.id === targetFolderId)) {
      dragItem.current = null;
      setDragOver(null);
      return;
    }
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

  async function openFolder(folder: FolderType) {
    if (searchQuery.trim()) {
      let path: FolderBreadcrumb[] = [folder];
      try {
        const response = await fetch(`/api/folders/${folder.id}/path`);
        if (response.ok) path = (await response.json()) as FolderBreadcrumb[];
      } catch {
        // Keep the selected folder usable even if its breadcrumb path fails.
      }
      setBreadcrumbs(path);
      setSearchResults(null);
      onSearchChange("");
    } else {
      setBreadcrumbs((previous) => [...previous, folder]);
    }
    setCurrentFolder(folder);
  }

  function renderFolderActions(folder: FolderType) {
    return (
      <ItemActions
        downloadUrl={`/api/folders/${folder.id}/download`}
        menuOpen={openMenuKey === `folder-${folder.id}`}
        onCloseMenu={() => setOpenMenuKey(null)}
        onDelete={() =>
          openDeleteModal({ id: folder.id, type: "folder" }, folder.name)
        }
        onRename={() =>
          openRenameModal({ id: folder.id, type: "folder" }, folder.name)
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
        onDelete={() =>
          openDeleteModal({ id: file.id, type: "file" }, file.name)
        }
        onRename={() =>
          openRenameModal({ id: file.id, type: "file" }, file.name)
        }
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
    return (
      <article
        className={`relative min-w-0 cursor-pointer overflow-visible rounded-[0.9rem] border border-gray-200 bg-white p-3 transition-colors hover:outline-2 hover:outline-blue-600 ${dragOver === folder.id ? "bg-blue-50 outline-2 outline-blue-600" : ""}`}
        draggable
        key={`folder-${folder.id}`}
        onClick={() => openFolder(folder)}
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
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid size-10.5 shrink-0 cursor-pointer place-items-center rounded-xl bg-blue-100 text-blue-500">
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
      </article>
    );
  }

  function renderFile(file: FileItem) {
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
        className="relative flex h-full min-w-0 cursor-pointer flex-col gap-2 overflow-visible rounded-[0.9rem] border border-gray-200 bg-white p-3 transition-colors hover:outline-2 hover:outline-blue-600"
        draggable
        key={`file-${file.id}`}
        onClick={() => setPreviewFile(file)}
        onDragEnd={() => {
          dragItem.current = null;
          setDragOver(null);
        }}
        onDragStart={() => {
          dragItem.current = { id: file.id, type: "file" };
        }}
      >
        <>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className={`grid size-10.5 shrink-0 cursor-pointer place-items-center rounded-xl ${iconTone === "image" ? "bg-green-100 text-green-700" : iconTone === "pdf" ? "bg-red-100 text-red-600" : iconTone === "audio" ? "bg-purple-100 text-purple-600" : iconTone === "video" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
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
      </article>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="h-full min-h-135 min-w-0 rounded-[1.25rem] bg-white p-4 sm:p-7">
        <div className="min-h-10.5tems-center mb-5 flex justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-1 text-gray-500"
          >
            {searchQuery.trim() ? (
              <span className="-ml-2 px-2 py-1 text-xl font-medium text-gray-900">
                Search results
              </span>
            ) : showStarred ? (
              <span className="-ml-2 px-2 py-1 text-xl font-medium text-gray-900">
                Starred items
              </span>
            ) : (
              <>
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
                      className={`max-w-55 overflow-hidden rounded-lg bg-transparent px-2 py-1 text-ellipsis whitespace-nowrap hover:bg-gray-100 ${index === breadcrumbs.length - 1 ? "text-xl font-medium text-gray-900" : ""} ${dragOver === breadcrumb.id ? "bg-blue-50 outline-2 outline-blue-600" : ""}`}
                      onClick={() => navigateTo(index)}
                      onDragLeave={() => setDragOver(null)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOver(breadcrumb.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void handleDrop(breadcrumb.id);
                      }}
                    >
                      {breadcrumb.name}
                    </button>
                  </span>
                ))}
              </>
            )}
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
            <p className="text-sm">Searching...</p>
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
                  <tr
                    className={`cursor-pointer transition-colors hover:outline-2 hover:outline-blue-600 ${dragOver === folder.id ? "bg-blue-50 outline-2 outline-blue-600" : ""}`}
                    draggable
                    key={`row-folder-${folder.id}`}
                    onClick={() => openFolder(folder)}
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
                    <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                      <button
                        className="inline-flex max-w-90 cursor-pointer items-center gap-3 overflow-hidden text-left text-gray-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          openFolder(folder);
                        }}
                      >
                        <Folder className="text-blue-500" size={19} />
                        <span className="overflow-hidden text-ellipsis">
                          {folder.name}
                        </span>
                      </button>
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
                    <tr
                      className="cursor-pointer transition-colors hover:outline-2 hover:outline-blue-600"
                      draggable
                      key={`row-file-${file.id}`}
                      onClick={() => setPreviewFile(file)}
                      onDragEnd={() => {
                        dragItem.current = null;
                        setDragOver(null);
                      }}
                      onDragStart={() => {
                        dragItem.current = { id: file.id, type: "file" };
                      }}
                    >
                      <td className="h-13.5 border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-500">
                        <button
                          className="inline-flex max-w-90 cursor-pointer items-center gap-3 overflow-hidden text-left text-gray-700"
                          onClick={() => setPreviewFile(file)}
                        >
                          <span className={fileIconColorClass(file.mimeType)}>
                            <FileTypeIcon mimeType={file.mimeType} size={19} />
                          </span>
                          <span className="overflow-hidden text-ellipsis">
                            {file.name}
                          </span>
                        </button>
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
      {modalAction && (
        <ModalDialog
          footer={
            <>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                disabled={modalPending}
                onClick={closeActionModal}
              >
                Cancel
              </button>
              <button
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60 ${modalAction.kind === "delete" ? "bg-red-600" : "bg-blue-500"}`}
                disabled={modalPending}
                onClick={() => void submitActionModal()}
              >
                {modalPending
                  ? modalAction.kind === "delete"
                    ? "Deleting…"
                    : modalAction.kind === "rename"
                      ? "Saving…"
                      : "Creating…"
                  : modalAction.kind === "delete"
                    ? "Delete"
                    : modalAction.kind === "rename"
                      ? "Save"
                      : "Create"}
              </button>
            </>
          }
          onClose={closeActionModal}
          title={
            modalAction.kind === "new-folder"
              ? "Create a folder"
              : modalAction.kind === "rename"
                ? `Rename ${modalAction.item.type}`
                : `Delete ${modalAction.item.type}?`
          }
        >
          {modalAction.kind === "delete" ? (
            <p className="text-sm text-gray-600">
              Delete “{modalAction.name}”
              {modalAction.item.type === "folder" && " and all its contents"}?
              This action cannot be undone.
            </p>
          ) : (
            <label
              className="grid gap-2 text-sm font-medium text-gray-700"
              htmlFor="action-modal-name"
            >
              {modalAction.kind === "new-folder" ? "Folder name" : "New name"}
              <input
                autoFocus
                className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3.5 outline-none focus:border-2 focus:border-blue-600"
                id="action-modal-name"
                onChange={(event) => {
                  setModalValue(event.target.value);
                  setModalError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !modalPending) {
                    void submitActionModal();
                  }
                  if (event.key === "Escape" && !modalPending) {
                    closeActionModal();
                  }
                }}
                value={modalValue}
              />
            </label>
          )}
          {modalError && (
            <p className="mt-3 text-xs text-red-700" role="alert">
              {modalError}
            </p>
          )}
        </ModalDialog>
      )}
    </div>
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
    <div className="relative shrink-0" ref={actionsRef}>
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Open file actions"
        className="grid size-8 place-items-center rounded-full text-gray-700 hover:bg-gray-200"
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu();
        }}
        title="Actions"
      >
        <MoreVertical size={20} />
      </button>
      {menuOpen && (
        <div
          className="absolute top-9 right-0 z-50 min-w-40 rounded-lg border border-gray-200 bg-white p-1 text-sm text-gray-700"
          onClick={(event) => event.stopPropagation()}
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
