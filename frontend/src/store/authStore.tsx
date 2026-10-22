import React, { useState } from 'react';
import { DEMO_USERS } from '../data/mockData';
import { apiClient } from '../services/api';
import { AuthContext, type Role, type User } from './authContext';

interface DemoLoginResponse {
  access_token: string;
}

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
