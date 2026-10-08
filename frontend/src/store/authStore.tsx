import React, { createContext, useContext, useState } from 'react';
import { DEMO_USERS } from '../data/mockData';
import { apiClient } from '../services/api';

type Role = 'customer' | 'agent' | 'manager';
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  accountId: string;
}
interface AuthCtx {
  user: User | null;
  login: (role: Role) => Promise<void>;
  logout: () => void;
}
interface DemoLoginResponse {
  access_token: string;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: async () => Promise.resolve(),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login = async (role: Role) => {
    const response = await apiClient.post<DemoLoginResponse>('/auth/demo-login', {
      role,
      password: 'Demo@12345',
    });
    localStorage.setItem('access_token', response.data.access_token);
    setUser(DEMO_USERS[role] as User);
  };
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
