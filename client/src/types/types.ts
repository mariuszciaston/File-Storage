export interface FileItem {
  folderId: null | number;
  id: number;
  mimeType: string;
  name: string;
  resourceType: "image" | "raw" | "video";
  secureUrl: string;
  size: number;
  starred: boolean;
  updatedAt: string;
}

export interface Folder {
  children: Folder[];
  files: FileItem[];
  id: number;
  name: string;
  parentId: null | number;
  starred: boolean;
  updatedAt: string;
}

export interface User {
  fullname: string;
  id: number;
  username: string;
}
