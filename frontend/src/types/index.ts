// Frontend-local types (shared package auth types deferred to Phase 2)
export type UserRole = 'customer' | 'agent' | 'manager';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
