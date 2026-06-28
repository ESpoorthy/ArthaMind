import type { UUID } from './common';

export type UserRole = 'customer' | 'agent' | 'manager';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserSession {
  userId: UUID;
  email: string;
  role: UserRole;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DemoLoginRequest {
  demoAccountId: string;
}
