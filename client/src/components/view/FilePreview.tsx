import { ArrowDownToLine, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { FileItem } from "../../types/types";

import { FileTypeIcon } from "../common/FileIcons";

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
      className="fixed inset-0 z-60 grid place-items-center bg-gray-900/60 p-4"
      onClick={onClose}
    >
      <section
        aria-label={`Preview ${file.name}`}
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-250 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
          <span className="inline-flex max-w-90 items-center gap-3 overflow-hidden text-left text-gray-700">
            <FileTypeIcon mimeType={file.mimeType} size={19} />
            <span className="truncate">{file.name}</span>
          </span>
          <div className="flex items-center gap-2">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100"
              download
              href={`/api/files/${file.id}/download`}
            >
              <ArrowDownToLine size={17} /> Download
            </a>
            <button
              aria-label="Close preview"
              className="grid size-9.5 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100"
              onClick={onClose}
            >
              <X size={19} />
            </button>
          </div>
        </header>
        <div className="grid min-h-75 flex-1 place-items-center overflow-auto p-4">
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
            <div className="grid min-h-85 place-items-center p-8 text-center text-gray-500">
              <div>
                <div className="mx-auto mb-4 grid size-19 place-items-center rounded-full bg-gray-100 text-gray-500">
                  <FileTypeIcon mimeType={file.mimeType} size={34} />
                </div>
                <p>No preview available for this file type.</p>
              </div>
            </div>
          )}
        </div>
      </section>
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

  return text === null ? null : <pre>{text}</pre>;
}
