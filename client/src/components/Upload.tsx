function Upload() {
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      body: formData,
      method: "POST",
    });

    const data = await response.json();

    console.log(data);
  }

  return (
    <input
      accept="image/png, image/jpeg, text/plain"
      className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:cursor-pointer"
      onChange={handleFile}
      type="file"
    />
  );
}

export default Upload;
