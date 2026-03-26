export interface AuthContextType {
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: null | User;
}

export interface AuthRedirectProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface User {
  fullname: string;
  id: string;
  username: string;
}
