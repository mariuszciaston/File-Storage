export default function FileUploader() {
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

    const response = await fetch("/api/files", {
      body: formData,
      method: "POST",
    });

    const data = await response.json();

    console.log(data);
  }

  return (
    <input
      accept="
  image/*,
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
      className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:cursor-pointer"
      onChange={handleFile}
      type="file"
    />
  );
}
