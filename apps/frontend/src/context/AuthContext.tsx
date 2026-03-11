import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, User } from "../types";
import { storage } from "../utils/storage";

interface AuthContextType {
  authState: AuthState;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshToken: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_USER":
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "LOGOUT":
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Nuevo estado para refreshToken
  const [refreshToken, setRefreshToken] = React.useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  useEffect(() => {
    const savedUser = storage.getUser();
    const savedToken = storage.getToken();
    const savedRefresh = localStorage.getItem("refreshToken");

    if (savedUser && savedToken && savedRefresh) {
      dispatch({ type: "SET_USER", payload: savedUser });
      setRefreshToken(savedRefresh);
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    storage.setUser(user);
    storage.setToken(accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    setRefreshToken(refreshToken);

    dispatch({ type: "SET_USER", payload: user });
  };

  const logout = () => {
    storage.clear();
    localStorage.removeItem("refreshToken");
    setRefreshToken(null);

    dispatch({ type: "LOGOUT" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        setLoading,
        setError,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

