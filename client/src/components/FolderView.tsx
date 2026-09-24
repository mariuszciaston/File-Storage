import { useEffect, useRef, useState } from "react";

import type { DragItem, FileItem, Folder } from "../types/types";

import FilePreview from "./FilePreview";
import FileUploader from "./FileUploader";

export default function FolderView() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderError, setNewFolderError] = useState("");
  const [renamingItem, setRenamingItem] = useState<null | {
    id: number;
    type: "file" | "folder";
  }>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [view, setView] = useState<"box" | "row">("row");
  const [showStarred, setShowStarred] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  type SortKey = "name" | "size" | "updatedAt";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<null | {
    files: FileItem[];
    folders: Folder[];
  }>(null);
  const [dragOver, setDragOver] = useState<"root" | null | number>(null);
  const dragItem = useRef<DragItem | null>(null);
  const searchTimer = useRef<null | ReturnType<typeof setTimeout>>(null);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setSearchResults(await res.json());
    }, 300);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function sortedFolders() {
    return [...folders]
      .filter((f) => !showStarred || f.starred)
      .sort((a, b) => {
        const av =
          sortKey === "updatedAt"
            ? new Date(a.updatedAt).getTime()
            : a.name.toLowerCase();
        const bv =
          sortKey === "updatedAt"
            ? new Date(b.updatedAt).getTime()
            : b.name.toLowerCase();
        return (av < bv ? -1 : av > bv ? 1 : 0) * (sortAsc ? 1 : -1);
      });
  }

  function sortedFiles() {
    return [...files]
      .filter((f) => !showStarred || f.starred)
      .sort((a, b) => {
        const av =
          sortKey === "size"
            ? a.size
            : sortKey === "updatedAt"
              ? new Date(a.updatedAt).getTime()
              : a.name.toLowerCase();
        const bv =
          sortKey === "size"
            ? b.size
            : sortKey === "updatedAt"
              ? new Date(b.updatedAt).getTime()
              : b.name.toLowerCase();
        return (av < bv ? -1 : av > bv ? 1 : 0) * (sortAsc ? 1 : -1);
      });
  }

  const parentId = currentFolder?.id ?? null;

  async function load() {
    const folderUrl =
      parentId != null ? `/api/folders?parentId=${parentId}` : "/api/folders";
    const fileUrl =
      parentId != null ? `/api/files?folderId=${parentId}` : "/api/files";
    const [foldersRes, filesRes] = await Promise.all([
      fetch(folderUrl),
      fetch(fileUrl),
    ]);
    if (foldersRes.ok) setFolders(await foldersRes.json());
    if (filesRes.ok) setFiles(await filesRes.json());
  }

  useEffect(() => {
    async function fetchData() {
      const folderUrl =
        parentId != null ? `/api/folders?parentId=${parentId}` : "/api/folders";
      const fileUrl =
        parentId != null ? `/api/files?folderId=${parentId}` : "/api/files";
      const [foldersRes, filesRes] = await Promise.all([
        fetch(folderUrl),
        fetch(fileUrl),
      ]);
      if (foldersRes.ok) setFolders(await foldersRes.json());
      if (filesRes.ok) setFiles(await filesRes.json());
    }
    fetchData();
  }, [parentId]);

  async function createFolder() {
    if (!newFolderName.trim()) {
      setNewFolderError("Folder name cannot be empty");
      return;
    }
    const res = await fetch("/api/folders", {
      body: JSON.stringify({ name: newFolderName.trim(), parentId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (res.ok) {
      setNewFolderName("");
      setNewFolderError("");
      setShowNewFolderModal(false);
      load();
    } else {
      const data = await res.json();
      setNewFolderError(data.errors?.[0]?.msg ?? "Failed to create folder");
    }
  }

  async function renameFolder(id: number) {
    if (!renameValue.trim()) {
      setRenameError("Folder name cannot be empty");
      return;
    }
    const res = await fetch(`/api/folders/${id}`, {
      body: JSON.stringify({ name: renameValue.trim() }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (res.ok) {
      setRenameError("");
      setRenamingItem(null);
      load();
    } else {
      const data = await res.json();
      setRenameError(data.errors?.[0]?.msg ?? "Failed to rename folder");
    }
  }

  async function renameFile(id: number) {
    if (!renameValue.trim()) {
      setRenameError("File name cannot be empty");
      return;
    }
    const res = await fetch(`/api/files/${id}`, {
      body: JSON.stringify({ name: renameValue.trim() }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (res.ok) {
      setRenameError("");
      setRenamingItem(null);
      load();
    } else {
      const data = await res.json();
      setRenameError(data.errors?.[0]?.msg ?? "Failed to rename file");
    }
  }

  async function deleteFolder(id: number) {
    if (!confirm("Delete this folder and all its contents?")) return;
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function deleteFile(file: FileItem) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function toggleFileStar(file: FileItem) {
    const res = await fetch(`/api/files/${file.id}/star`, { method: "PATCH" });
    if (res.ok) {
      const updated: FileItem = await res.json();
      setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    }
  }

  async function toggleFolderStar(folder: Folder) {
    const res = await fetch(`/api/folders/${folder.id}/star`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated: Folder = await res.json();
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folder.id ? { ...f, starred: updated.starred } : f,
        ),
      );
    }
  }

  function openFolder(folder: Folder) {
    setBreadcrumbs((prev) => [...prev, folder]);
    setCurrentFolder(folder);
  }

  async function handleDrop(targetFolderId: null | number) {
    const item = dragItem.current;
    if (!item || item.id === targetFolderId) return;
    const url =
      item.type === "folder"
        ? `/api/folders/${item.id}/move`
        : `/api/files/${item.id}/move`;
    const body =
      item.type === "folder"
        ? { parentId: targetFolderId }
        : { folderId: targetFolderId };
    const res = await fetch(url, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (res.ok) load();
    dragItem.current = null;
    setDragOver(null);
  }

  function navigateTo(index: number) {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentFolder(null);
    } else {
      const target = breadcrumbs[index];
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
      setCurrentFolder(target);
    }
  }

  return (
    <div className="flex gap-6">
      {/* Left column: actions */}
      <div className="flex w-56 shrink-0 flex-col gap-4">
        {/* Create folder */}
        <button
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => setShowNewFolderModal(true)}
        >
          New folder
        </button>

        {/* Upload */}
        <FileUploader folderId={parentId ?? undefined} onUploaded={load} />
        <hr></hr>
        {/* Starred */}
        <button
          className={`cursor-pointer rounded px-4 py-2 text-left ${
            !showStarred
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setShowStarred(false)}
        >
          All
        </button>
        <button
          className={`cursor-pointer rounded px-4 py-2 text-left ${
            showStarred
              ? "bg-yellow-400 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setShowStarred(true)}
        >
          ★ Starred
        </button>
      </div>

      {/* Right column: browser */}
      <div className="flex-1 space-y-4">
        {/* Search */}
        <input
          className="w-full rounded border px-3 py-1.5 text-sm"
          onChange={handleSearchChange}
          placeholder="Search files and folders…"
          type="search"
          value={searchQuery}
        />

        {/* Breadcrumbs + view toggle */}
        <div className="flex items-center justify-between">
          <nav className="flex flex-wrap items-center gap-1">
            <button
              className={`cursor-pointer text-blue-600 hover:underline ${
                dragOver === "root" ? "rounded bg-blue-100 px-1" : ""
              }`}
              onClick={() => navigateTo(-1)}
              onDragLeave={() => setDragOver(null)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver("root");
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(null);
              }}
            >
              Storage
            </button>
            {breadcrumbs.map((b, i) => (
              <span className="flex items-center gap-1" key={b.id}>
                <span>{">"}</span>
                <button
                  className={`cursor-pointer text-blue-600 hover:underline ${
                    dragOver === b.id ? "rounded bg-blue-100 px-1" : ""
                  }`}
                  onClick={() => navigateTo(i)}
                  onDragLeave={() => setDragOver(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(b.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(b.id);
                  }}
                >
                  {b.name}
                </button>
              </span>
            ))}
          </nav>
          <div className="flex gap-1">
            <button
              className={`rounded px-4 py-2 ${
                view === "row"
                  ? "bg-blue-500 text-white"
                  : "cursor-pointer bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("row")}
              title="List view"
            >
              ☰ List
            </button>
            <button
              className={`rounded px-4 py-2 ${
                view === "box"
                  ? "bg-blue-500 text-white"
                  : "cursor-pointer bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setView("box")}
              title="Grid view"
            >
              ⊞ Grid
            </button>
          </div>
        </div>

        {/* Search results */}
        {searchResults && (
          <div className="space-y-1">
            {searchResults.folders.length === 0 &&
            searchResults.files.length === 0 ? (
              <p className="text-sm text-gray-400">No results found.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {searchResults.folders.map((folder) => (
                    <tr
                      className="border-b bg-white hover:bg-gray-50"
                      key={`sf-${folder.id}`}
                    >
                      <td className="px-3 py-2">
                        <button
                          className="font-medium hover:underline"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults(null);
                            openFolder(folder);
                          }}
                        >
                          📁 {folder.name}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-gray-400">Folder</td>
                    </tr>
                  ))}
                  {searchResults.files.map((file) => (
                    <tr
                      className="border-b bg-white hover:bg-gray-50"
                      key={`sfi-${file.id}`}
                    >
                      <td className="px-3 py-2">
                        <button
                          className="hover:underline"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults(null);
                            setPreviewFile(file);
                          }}
                        >
                          📄 {file.name}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* List view: sortable table */}
        {!searchResults &&
          view === "row" &&
          (folders.length > 0 || files.length > 0) && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  {(["name", "size", "updatedAt"] as const).map((key) => (
                    <th
                      className="cursor-pointer px-3 py-2 select-none hover:text-gray-800"
                      key={key}
                      onClick={() => toggleSort(key)}
                    >
                      {key === "name"
                        ? "Name"
                        : key === "size"
                          ? "Size"
                          : "Last modified"}
                      {sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedFolders().map((folder) => (
                  <tr
                    className={`border-b bg-white hover:bg-gray-50 ${
                      dragOver === folder.id
                        ? "outline outline-2 outline-blue-400"
                        : ""
                    }`}
                    draggable
                    key={`folder-${folder.id}`}
                    onDragEnd={() => {
                      dragItem.current = null;
                      setDragOver(null);
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(folder.id);
                    }}
                    onDragStart={() => {
                      dragItem.current = { id: folder.id, type: "folder" };
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(folder.id);
                    }}
                  >
                    <td className="relative px-3 py-2">
                      {renamingItem?.type === "folder" &&
                        renamingItem.id === folder.id && (
                          <span className="invisible font-medium">
                            📁 {folder.name}
                          </span>
                        )}
                      {renamingItem?.type === "folder" &&
                      renamingItem.id === folder.id ? (
                        <span className="absolute inset-0 flex items-center gap-2 px-3">
                          <input
                            autoFocus
                            className={`min-w-0 flex-1 rounded border px-2 py-0.5 text-sm ${renameError ? "border-red-400" : ""}`}
                            onChange={(e) => {
                              setRenameValue(e.target.value);
                              setRenameError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameFolder(folder.id);
                              if (e.key === "Escape") {
                                setRenamingItem(null);
                                setRenameError("");
                              }
                            }}
                            value={renameValue}
                          />
                          <button
                            className="shrink-0 text-green-600 hover:underline"
                            onClick={() => renameFolder(folder.id)}
                          >
                            Save
                          </button>
                          <button
                            className="shrink-0 text-gray-500 hover:underline"
                            onClick={() => {
                              setRenamingItem(null);
                              setRenameError("");
                            }}
                          >
                            Cancel
                          </button>
                          {renameError && (
                            <span className="absolute top-full left-3 z-10 text-xs text-red-500">
                              {renameError}
                            </span>
                          )}
                        </span>
                      ) : (
                        <button
                          className="font-medium hover:underline"
                          onClick={() => openFolder(folder)}
                        >
                          📁 {folder.name}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-400">—</td>
                    <td className="px-3 py-2 text-gray-400">
                      {new Date(folder.updatedAt).toLocaleString(undefined, {
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex gap-2 text-gray-500">
                        <button
                          className="hover:text-yellow-500"
                          onClick={() => {
                            setRenamingItem({ id: folder.id, type: "folder" });
                            setRenameValue(folder.name);
                            setRenameError("");
                          }}
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          className="hover:text-red-500"
                          onClick={() => deleteFolder(folder.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button className="hover:text-blue-500" title="Share">
                          🔗
                        </button>
                        <a
                          className="hover:text-green-500"
                          download
                          href={`/api/folders/${folder.id}/download`}
                          title="Download"
                        >
                          ⬇️
                        </a>
                        <button
                          className={
                            folder.starred
                              ? "text-yellow-400"
                              : "hover:text-yellow-400"
                          }
                          onClick={() => toggleFolderStar(folder)}
                          title={folder.starred ? "Unstar" : "Star"}
                        >
                          {folder.starred ? "★" : "☆"}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedFiles().map((file) => (
                  <tr
                    className="border-b bg-white hover:bg-gray-50"
                    draggable
                    key={`file-${file.id}`}
                    onDragEnd={() => {
                      dragItem.current = null;
                      setDragOver(null);
                    }}
                    onDragStart={() => {
                      dragItem.current = { id: file.id, type: "file" };
                    }}
                  >
                    <td className="relative px-3 py-2">
                      {renamingItem?.type === "file" &&
                        renamingItem.id === file.id && (
                          <span className="invisible">📄 {file.name}</span>
                        )}
                      {renamingItem?.type === "file" &&
                      renamingItem.id === file.id ? (
                        <span className="absolute inset-0 flex items-center gap-2 px-3">
                          <input
                            autoFocus
                            className={`min-w-0 flex-1 rounded border px-2 py-0.5 text-sm ${renameError ? "border-red-400" : ""}`}
                            onChange={(e) => {
                              setRenameValue(e.target.value);
                              setRenameError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameFile(file.id);
                              if (e.key === "Escape") {
                                setRenamingItem(null);
                                setRenameError("");
                              }
                            }}
                            value={renameValue}
                          />
                          <button
                            className="shrink-0 text-green-600 hover:underline"
                            onClick={() => renameFile(file.id)}
                          >
                            Save
                          </button>
                          <button
                            className="shrink-0 text-gray-500 hover:underline"
                            onClick={() => {
                              setRenamingItem(null);
                              setRenameError("");
                            }}
                          >
                            Cancel
                          </button>
                          {renameError && (
                            <span className="absolute top-full left-3 z-10 text-xs text-red-500">
                              {renameError}
                            </span>
                          )}
                        </span>
                      ) : (
                        <button
                          className="hover:underline"
                          onClick={() => setPreviewFile(file)}
                        >
                          📄 {file.name}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-3 py-2 text-gray-400">
                      {new Date(file.updatedAt).toLocaleString(undefined, {
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex gap-2 text-gray-500">
                        <button
                          className="hover:text-yellow-500"
                          onClick={() => {
                            setRenamingItem({ id: file.id, type: "file" });
                            setRenameValue(file.name);
                            setRenameError("");
                          }}
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          className="hover:text-red-500"
                          onClick={() => deleteFile(file)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button className="hover:text-blue-500" title="Share">
                          🔗
                        </button>
                        <a
                          className="hover:text-green-500"
                          download
                          href={`/api/files/${file.id}/download`}
                          title="Download"
                        >
                          ⬇️
                        </a>
                        <button
                          className={
                            file.starred
                              ? "text-yellow-400"
                              : "hover:text-yellow-400"
                          }
                          onClick={() => toggleFileStar(file)}
                          title={file.starred ? "Unstar" : "Star"}
                        >
                          {file.starred ? "★" : "☆"}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        {/* Grid view */}
        {!searchResults && view === "box" && (
          <>
            {(folders.length > 0 || files.length > 0) && (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {sortedFolders().map((folder) => (
                  <li
                    className={`flex flex-col items-center gap-1 rounded bg-white p-3 text-center ${
                      dragOver === folder.id
                        ? "outline outline-2 outline-blue-400"
                        : ""
                    }`}
                    draggable
                    key={folder.id}
                    onDragEnd={() => {
                      dragItem.current = null;
                      setDragOver(null);
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(folder.id);
                    }}
                    onDragStart={() => {
                      dragItem.current = { id: folder.id, type: "folder" };
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(folder.id);
                    }}
                  >
                    {renamingItem?.type === "folder" &&
                    renamingItem.id === folder.id ? (
                      <>
                        <input
                          autoFocus
                          className={`rounded border px-2 py-0.5 text-sm ${renameError ? "border-red-400" : ""}`}
                          onChange={(e) => {
                            setRenameValue(e.target.value);
                            setRenameError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameFolder(folder.id);
                            if (e.key === "Escape") {
                              setRenamingItem(null);
                              setRenameError("");
                            }
                          }}
                          value={renameValue}
                        />
                        <button
                          className="text-sm text-green-600 hover:underline"
                          onClick={() => renameFolder(folder.id)}
                        >
                          Save
                        </button>
                        <button
                          className="text-sm text-gray-500 hover:underline"
                          onClick={() => {
                            setRenamingItem(null);
                            setRenameError("");
                          }}
                        >
                          Cancel
                        </button>
                        {renameError && (
                          <p className="text-xs text-red-500">{renameError}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">📁</span>
                        <button
                          className="w-full text-sm font-medium break-words hover:underline"
                          onClick={() => openFolder(folder)}
                        >
                          {folder.name}
                        </button>
                        <div className="flex gap-2 text-gray-500">
                          <button
                            className="hover:text-yellow-500"
                            onClick={() => {
                              setRenamingItem({
                                id: folder.id,
                                type: "folder",
                              });
                              setRenameValue(folder.name);
                              setRenameError("");
                            }}
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            className="hover:text-red-500"
                            onClick={() => deleteFolder(folder.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button className="hover:text-blue-500" title="Share">
                            🔗
                          </button>
                          <a
                            className="hover:text-green-500"
                            download
                            href={`/api/folders/${folder.id}/download`}
                            title="Download"
                          >
                            ⬇️
                          </a>
                          <button
                            className={
                              folder.starred
                                ? "text-yellow-400"
                                : "hover:text-yellow-400"
                            }
                            onClick={() => toggleFolderStar(folder)}
                            title={folder.starred ? "Unstar" : "Star"}
                          >
                            {folder.starred ? "★" : "☆"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
                {sortedFiles().map((file) => (
                  <li
                    className="flex flex-col items-center gap-1 rounded bg-white p-3 text-center text-sm"
                    draggable
                    key={file.id}
                    onDragEnd={() => {
                      dragItem.current = null;
                      setDragOver(null);
                    }}
                    onDragStart={() => {
                      dragItem.current = { id: file.id, type: "file" };
                    }}
                  >
                    {renamingItem?.type === "file" &&
                    renamingItem.id === file.id ? (
                      <>
                        <input
                          autoFocus
                          className={`w-full rounded border px-2 py-0.5 text-sm ${renameError ? "border-red-400" : ""}`}
                          onChange={(e) => {
                            setRenameValue(e.target.value);
                            setRenameError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameFile(file.id);
                            if (e.key === "Escape") {
                              setRenamingItem(null);
                              setRenameError("");
                            }
                          }}
                          value={renameValue}
                        />
                        <div className="flex gap-2">
                          <button
                            className="text-sm text-green-600 hover:underline"
                            onClick={() => renameFile(file.id)}
                          >
                            Save
                          </button>
                          <button
                            className="text-sm text-gray-500 hover:underline"
                            onClick={() => {
                              setRenamingItem(null);
                              setRenameError("");
                            }}
                          >
                            Cancel
                          </button>
                          {renameError && (
                            <p className="text-xs text-red-500">
                              {renameError}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-3xl"
                          onClick={() => setPreviewFile(file)}
                        >
                          📄
                        </button>
                        <button
                          className="w-full break-words hover:underline"
                          onClick={() => setPreviewFile(file)}
                        >
                          {file.name}
                        </button>
                        <div className="flex gap-2 text-gray-500">
                          <button
                            className="hover:text-yellow-500"
                            onClick={() => {
                              setRenamingItem({ id: file.id, type: "file" });
                              setRenameValue(file.name);
                              setRenameError("");
                            }}
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            className="hover:text-red-500"
                            onClick={() => deleteFile(file)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button className="hover:text-blue-500" title="Share">
                            🔗
                          </button>
                          <a
                            className="hover:text-green-500"
                            download
                            href={`/api/files/${file.id}/download`}
                            title="Download"
                          >
                            ⬇️
                          </a>
                          <button
                            className={
                              file.starred
                                ? "text-yellow-400"
                                : "hover:text-yellow-400"
                            }
                            onClick={() => toggleFileStar(file)}
                            title={file.starred ? "Unstar" : "Star"}
                          >
                            {file.starred ? "★" : "☆"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {/* New folder modal */}
      {showNewFolderModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          onClick={() => {
            setShowNewFolderModal(false);
            setNewFolderError("");
          }}
        >
          <div
            className="flex flex-col gap-3 rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold">New folder</h2>
            <input
              autoFocus
              className={`rounded border px-2 py-1 text-sm ${newFolderError ? "border-red-400" : ""}`}
              onChange={(e) => {
                setNewFolderName(e.target.value);
                setNewFolderError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") {
                  setShowNewFolderModal(false);
                  setNewFolderError("");
                }
              }}
              placeholder="Folder name"
              value={newFolderName}
            />
            {newFolderError && (
              <p className="text-xs text-red-500">{newFolderError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderError("");
                }}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                onClick={createFolder}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
