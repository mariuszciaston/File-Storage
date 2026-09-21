export interface AuthContextType {
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: null | User;
}

export interface AuthRedirectProps {
  children: React.ReactNode;
}

export interface FileItem {
  folderId: null | number;
  id: number;
  name: string;
  size: number;
  starred: boolean;
  updatedAt: string;
  url: string;
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

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface User {
  fullname: string;
  id: number;
  username: string;
}
