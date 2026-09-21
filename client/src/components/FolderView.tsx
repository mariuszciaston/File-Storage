import { useEffect, useState } from "react";

import type { FileItem, Folder } from "../types/types";

import FileUploader from "./FileUploader";

export default function FolderView() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [renamingId, setRenamingId] = useState<null | number>(null);
  const [renameValue, setRenameValue] = useState("");
  const [view, setView] = useState<"box" | "row">("row");
  const [showStarred, setShowStarred] = useState(false);
  type SortKey = "name" | "size" | "updatedAt";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

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
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/folders", {
      body: JSON.stringify({ name: newFolderName.trim(), parentId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (res.ok) {
      setNewFolderName("");
      setShowNewFolderModal(false);
      load();
    }
  }

  async function renameFolder(id: number) {
    if (!renameValue.trim()) return;
    const res = await fetch(`/api/folders/${id}`, {
      body: JSON.stringify({ name: renameValue.trim() }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (res.ok) {
      setRenamingId(null);
      load();
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
        {/* Breadcrumbs + view toggle */}
        <div className="flex items-center justify-between">
          <nav className="flex flex-wrap items-center gap-1">
            <button
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => navigateTo(-1)}
            >
              Storage
            </button>
            {breadcrumbs.map((b, i) => (
              <span className="flex items-center gap-1" key={b.id}>
                <span>{">"}</span>
                <button
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigateTo(i)}
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

        {/* List view: sortable table */}
        {view === "row" && (folders.length > 0 || files.length > 0) && (
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
                  className="border-b bg-white hover:bg-gray-50"
                  key={`folder-${folder.id}`}
                >
                  <td className="relative px-3 py-2">
                    {renamingId === folder.id && (
                      <span className="invisible font-medium">
                        📁 {folder.name}
                      </span>
                    )}
                    {renamingId === folder.id ? (
                      <span className="absolute inset-0 flex items-center gap-2 px-3">
                        <input
                          autoFocus
                          className="min-w-0 flex-1 rounded border px-2 py-0.5 text-sm"
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameFolder(folder.id);
                            if (e.key === "Escape") setRenamingId(null);
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
                          onClick={() => setRenamingId(null)}
                        >
                          Cancel
                        </button>
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
                      <button className="hover:text-blue-500" title="Share">
                        🔗
                      </button>
                      <button
                        className="hover:text-yellow-500"
                        onClick={() => {
                          setRenamingId(folder.id);
                          setRenameValue(folder.name);
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
                  key={`file-${file.id}`}
                >
                  <td className="px-3 py-2">📄 {file.name}</td>
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
                        className="hover:text-red-500"
                        onClick={() => deleteFile(file)}
                        title="Delete"
                      >
                        🗑️
                      </button>
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
        {view === "box" && (
          <>
            {(folders.length > 0 || files.length > 0) && (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {sortedFolders().map((folder) => (
                  <li
                    className="flex flex-col items-center gap-1 rounded bg-white p-3 text-center"
                    key={folder.id}
                  >
                    {renamingId === folder.id ? (
                      <>
                        <input
                          autoFocus
                          className="rounded border px-2 py-0.5 text-sm"
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameFolder(folder.id);
                            if (e.key === "Escape") setRenamingId(null);
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
                          onClick={() => setRenamingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">📁</span>
                        <button
                          className="text-sm font-medium hover:underline"
                          onClick={() => openFolder(folder)}
                        >
                          {folder.name}
                        </button>
                        <div className="flex gap-2">
                          <button
                            className="text-sm text-gray-500 hover:underline"
                            onClick={() => {
                              setRenamingId(folder.id);
                              setRenameValue(folder.name);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="text-sm text-red-500 hover:underline"
                            onClick={() => deleteFolder(folder.id)}
                          >
                            Delete
                          </button>
                          <button
                            className={`text-sm ${folder.starred ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"}`}
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
                    key={file.id}
                  >
                    <span className="text-3xl">📄</span>
                    <span>{file.name}</span>
                    <span className="text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => deleteFile(file)}
                      >
                        Delete
                      </button>
                      <button
                        className={
                          file.starred
                            ? "text-yellow-400"
                            : "text-gray-500 hover:text-yellow-400"
                        }
                        onClick={() => toggleFileStar(file)}
                        title={file.starred ? "Unstar" : "Star"}
                      >
                        {file.starred ? "★" : "☆"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      {/* New folder modal */}
      {showNewFolderModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          onClick={() => setShowNewFolderModal(false)}
        >
          <div
            className="flex flex-col gap-3 rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold">New folder</h2>
            <input
              autoFocus
              className="rounded border px-2 py-1 text-sm"
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") setShowNewFolderModal(false);
              }}
              placeholder="Folder name"
              value={newFolderName}
            />
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                onClick={() => setShowNewFolderModal(false)}
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
