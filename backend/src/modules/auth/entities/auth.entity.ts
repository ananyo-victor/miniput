export interface AdminTokenPayload {
  id: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken: string;
}
