import { createContext } from "react";

import type { User } from "../types/types";

interface AuthContextType {
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: null | User;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
