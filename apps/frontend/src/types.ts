export type Role = "NUTRICIONISTA" | "LABORATORIO";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  role: Role; 
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export enum AuthView {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  DASHBOARD = "DASHBOARD",
}
