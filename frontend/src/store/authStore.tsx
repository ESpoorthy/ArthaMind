import React, { createContext, useContext, useState } from 'react';
import { DEMO_USERS } from '../data/mockData';

type Role = 'customer' | 'agent' | 'manager';
interface User { id: string; name: string; email: string; role: Role; accountId: string; }
interface AuthCtx { user: User | null; login: (role: Role) => void; logout: () => void; }

const AuthContext = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login = (role: Role) => setUser(DEMO_USERS[role] as User);
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
