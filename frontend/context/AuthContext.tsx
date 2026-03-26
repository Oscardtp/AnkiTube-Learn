"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  api,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser as setStoredUser,
  removeUser,
  APIError,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const storedUser = getUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const freshUser = await api.getMe();
          setUser(freshUser);
          setStoredUser(freshUser);
        } catch (err) {
          // Token expired or invalid
          removeToken();
          removeUser();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await api.login(data);
      setToken(response.access_token);
      setStoredUser(response.user);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof APIError ? err.message : "Error al iniciar sesion";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await api.register(data);
      setToken(response.access_token);
      setStoredUser(response.user);
      setUser(response.user);
    } catch (err) {
      const message = err instanceof APIError ? err.message : "Error al registrarse";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await api.getMe();
      setUser(freshUser);
      setStoredUser(freshUser);
    } catch (err) {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
