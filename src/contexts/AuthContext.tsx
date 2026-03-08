import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await api.post<ApiResponse<AuthUser>>("/auth/login", payload);
      const mockUser: AuthUser = {
        id: "1",
        name: "Admin",
        email: payload.email,
        role: "admin",
        token: "mock-jwt-token",
      };
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      localStorage.setItem("auth_token", mockUser.token);
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // await api.post("/auth/register", payload);
      const mockUser: AuthUser = {
        id: "1",
        name: payload.name,
        email: payload.email,
        role: "admin",
        token: "mock-jwt-token",
      };
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      localStorage.setItem("auth_token", mockUser.token);
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
