import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { AuthUser, RegisterPayload } from "@/types";
import useFetch from "@/hooks/useFetch/hook";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginSchemaType } from "@/schemas/loginSchema";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingPages: boolean;
  isLoadingLogin: boolean;
  setLoadingPages: React.Dispatch<React.SetStateAction<boolean>>;
  login: (payload: LoginSchemaType) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [requestLogin, isLoadingLogin] = useFetch<AuthUser>();
  const [requestValidateToken] = useFetch<AuthUser>();
  const [isLoadingPages, setLoadingPages] = React.useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const getCookie = (name: string) => {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
    return value ? decodeURIComponent(value) : undefined;
  };

  const handleSetCookies = (accessToken: string, refreshToken: string) => {
    document.cookie = `access=${encodeURIComponent(accessToken)}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = `refresh=${encodeURIComponent(refreshToken)}; path=/; max-age=604800; SameSite=Lax`;
  };

  const handleUserState = useCallback((data: AuthUser & { user_id?: number; username?: string; level?: string }) => {
    const mapped: AuthUser = {
      id: String(data.user_id ?? data.id),
      name: data.username ?? data.name,
      email: data.email,
      role: data.level ?? data.role,
      access: data.access,
      refresh: data.refresh,
    };
    setUser(mapped);
    handleSetCookies(data.access, data.refresh);
  }, []);

  const clearSession = useCallback(() => {
    document.cookie = "access=; path=/; max-age=0";
    document.cookie = "refresh=; path=/; max-age=0";
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate("/");
  }, [clearSession, navigate]);

  const handleValidateToken = useCallback(async () => {
    const refreshToken = getCookie("refresh");

    if (!refreshToken) {
      if (!isPublicRoute) {
        logout();
        setLoadingPages(false);
      }
      setLoadingPages(false);
      return;
    }

    const resp = await requestValidateToken(`/auth/refresh/`, {
      method: "POST",
      body: { refresh: refreshToken },
    })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setLoadingPages(false);
      });

    if (resp) {
      if (isPublicRoute) {
        navigate("/users");
      }
      setIsAuthenticated(true);
      handleUserState(resp.data);
    }
  }, [isPublicRoute, clearSession, logout, navigate]);

  useEffect(() => {
    handleValidateToken();
  }, []);

  const login = async (formData: LoginSchemaType) => {
    const resp = await requestLogin("/auth/login/", {
      method: "POST",
      body: formData,
    });

    if (resp.data) {
      handleUserState(resp.data);
      navigate("/admin");
    }
  };

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoadingPages(true);
    try {
      // TODO: Replace with real API call
      // await api.post("/auth/register", payload);
      const mockUser: AuthUser = {
        id: "1",
        name: payload.name,
        email: payload.email,
        role: "admin",
        access: "mock-jwt-token",
        refresh: "mock-refresh-token",
      };
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      localStorage.setItem("auth_token", mockUser.access);
      setUser(mockUser);
    } finally {
      setLoadingPages(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingPages,
        isLoadingLogin,
        setLoadingPages,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
