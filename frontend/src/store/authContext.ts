import { createContext } from 'react';

export type Role = 'customer' | 'agent' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  accountId: string;
}

export interface AuthContextValue {
  user: User | null;
  login: (role: Role) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => Promise.resolve(),
  logout: () => {},
});
