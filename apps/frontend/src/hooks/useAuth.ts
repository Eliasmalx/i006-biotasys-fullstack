import { useAuth as useAuthContext } from "../context/AuthContext";
import { User } from "../types";

export const useAuth = () => {
  const {
    authState,
    login,
    logout,
    setLoading,
    setError,
    refreshToken,
  } = useAuthContext();

  // Adaptamos login para aceptar accessToken + refreshToken
  const loginUser = (
    user: User,
    accessToken: string,
    refreshTokenValue: string
  ) => {
    login(user, accessToken, refreshTokenValue);
  };

  const logoutUser = () => {
    logout();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,

    login: loginUser,
    logout: logoutUser,

    refreshToken, // ahora disponible para logout en el Navbar

    setLoading,
    setError,
    clearError,
  };
};


