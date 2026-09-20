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
      </div>

      {/* Right column: browser */}
      <div className="flex-1 space-y-4">
        {/* Breadcrumbs */}
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

        {/* Folders */}
        {folders.length > 0 && (
          <ul className="space-y-1">
            {folders.map((folder) => (
              <li
                className="flex items-center gap-2 rounded bg-white px-3 py-2"
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
                    <button
                      className="flex-1 text-left text-sm font-medium hover:underline"
                      onClick={() => openFolder(folder)}
                    >
                      📁 {folder.name}
                    </button>
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
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Files */}
        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((file) => (
              <li
                className="flex items-center gap-2 rounded bg-white px-3 py-2 text-sm"
                key={file.id}
              >
                <span className="flex-1">
                  📄 {file.name}{" "}
                  <span className="text-gray-400">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => deleteFile(file)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
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
