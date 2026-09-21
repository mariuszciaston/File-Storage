import { useEffect, useState } from "react";

import type { FileItem } from "../types/types";

interface Props {
  file: FileItem;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: Props) {
  const src = `/api/files/${file.id}/preview`;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["bmp", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(
    ext,
  );
  const isVideo = ["mp4", "ogg", "webm"].includes(ext);
  const isAudio = ["flac", "mp3", "ogg", "wav"].includes(ext);
  const isPdf = ext === "pdf";
  const isText = [
    "css",
    "csv",
    "html",
    "js",
    "json",
    "md",
    "ts",
    "txt",
    "xml",
    "yaml",
    "yml",
  ].includes(ext);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="truncate text-sm font-medium">{file.name}</span>
          <div className="flex items-center gap-3">
            <a
              className="text-sm text-blue-500 hover:underline"
              download
              href={`/api/files/${file.id}/download`}
            >
              ⬇️ Download
            </a>
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {isImage && (
            <img
              alt={file.name}
              className="max-h-[75vh] max-w-full object-contain"
              src={src}
            />
          )}
          {isVideo && (
            <video className="max-h-[75vh] max-w-full" controls src={src} />
          )}
          {isAudio && <audio controls src={src} />}
          {isPdf && (
            <iframe className="h-[75vh] w-full" src={src} title={file.name} />
          )}
          {isText && <TextPreview src={src} />}
          {!isImage && !isVideo && !isAudio && !isPdf && !isText && (
            <div className="text-center text-gray-500">
              <p className="mb-3 text-4xl">📄</p>
              <p className="mb-4 text-sm">
                No preview available for this file type.
              </p>
              <a
                className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                download
                href={`/api/files/${file.id}/download`}
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TextPreview({ src }: { src: string }) {
  const [text, setText] = useState<null | string>(null);

  useEffect(() => {
    fetch(src)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText("Failed to load file."));
  }, [src]);

  return (
    <pre className="max-h-[75vh] w-full overflow-auto rounded bg-gray-50 p-4 text-sm break-words whitespace-pre-wrap">
      {text ?? "Loading…"}
    </pre>
  );
}
