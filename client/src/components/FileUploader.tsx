import { Upload } from "lucide-react";

export default function FileUploader({
  folderId,
  onUploaded,
}: {
  folderId?: number;
  onUploaded?: () => void;
}) {
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File size must not exceed 1MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (folderId != null) formData.append("folderId", String(folderId));

    const response = await fetch("/api/files", {
      body: formData,
      method: "POST",
    });

    if (response.ok) {
      if (onUploaded) onUploaded();
    } else {
      const data = await response.json();
      alert(data.errors?.[0]?.msg ?? data.error ?? "Upload failed.");
    }

    event.target.value = "";
  }

  return (
    <>
      <input
        accept="
  image/bmp,
	image/gif,
	image/jpeg,
	image/png,
  image/svg+xml,
	image/tiff,
	image/webp,

  application/pdf,
  text/plain,

  application/msword,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
  application/vnd.ms-excel,
  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
  application/vnd.ms-powerpoint,
  application/vnd.openxmlformats-officedocument.presentationml.presentation,

  application/vnd.oasis.opendocument.text,
  application/vnd.oasis.opendocument.spreadsheet,
  application/vnd.oasis.opendocument.presentation,

  .doc,
  .docx,
  .xls,
  .xlsx,
  .ppt,
  .pptx,
  .odt,
  .ods,
  .odp
"
        className="hidden"
        id="file-upload"
        onChange={handleFile}
        type="file"
      />
      <label
        className="inline-flex min-h-14 cursor-pointer items-center gap-3 self-start rounded-2xl border border-gray-200 bg-white px-5 font-semibold text-gray-700 transition hover:outline-2 hover:outline-blue-600"
        htmlFor="file-upload"
      >
        <Upload aria-hidden="true" size={19} /> Upload file
      </label>
    </>
  );
}
