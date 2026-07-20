"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "http://localhost:8000/api/v1";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("arenamind_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("arenamind_user");
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("arenamind_token");
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("arenamind_token");
      const storedUser = localStorage.getItem("arenamind_user");
      if (stored && storedUser) {
        return false;
      }
    }
    return true;
  });

  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }));
        return { success: false, error: err.message || "Invalid credentials" };
      }

      const data = await res.json();
      const accessToken = data.access_token;

      // Fetch user profile
      const profileRes = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let userData: AuthUser;
      if (profileRes.ok) {
        userData = await profileRes.json();
      } else {
        // Fallback: extract from token or use defaults
        userData = { id: "", email, full_name: email.split("@")[0], role: "viewer" };
      }

      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("arenamind_token", accessToken);
      localStorage.setItem("arenamind_user", JSON.stringify(userData));

      return { success: true };
    } catch {
      return { success: false, error: "Cannot connect to backend server" };
    }
  }, []);

  // On mount, perform auto-login if credentials not present in storage
  useEffect(() => {
    if (token && user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    login("operator@arenamind.ai", "ComplexSecureP@ss4862").then((res) => {
      if (!res.success) {
        // Fallback to local mock session if backend is down or unreachable
        const mockUser = {
          id: "mock-operator-id",
          email: "operator@arenamind.ai",
          full_name: "Operations Center Controller",
          role: "operator",
        };
        setToken("mock_token");
        setUser(mockUser);
        localStorage.setItem("arenamind_token", "mock_token");
        localStorage.setItem("arenamind_user", JSON.stringify(mockUser));
      }
      setIsLoading(false);
    });
  }, [login, token, user]);

  // Bypass login redirects
  useEffect(() => {
    // Auto-login manages user session. No redirection to /login.
  }, []);


  const register = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Registration failed" }));
        return { success: false, error: err.message || "Registration failed" };
      }

      // Auto-login after register
      return login(email, password);
    } catch {
      return { success: false, error: "Cannot connect to backend server" };
    }
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("arenamind_token");
    localStorage.removeItem("arenamind_user");
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
