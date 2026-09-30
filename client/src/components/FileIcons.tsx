import { File, FileAudio, FileImage, FileText, FileVideo } from "lucide-react";

export function FileTypeIcon({
  mimeType,
  size = 28,
}: {
  mimeType: string;
  size?: number;
}) {
  if (mimeType.startsWith("image/")) return <FileImage size={size} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={size} />;
  if (mimeType.startsWith("audio/")) return <FileAudio size={size} />;
  if (mimeType === "application/pdf") return <FileText size={size} />;
  return <File size={size} />;
}
