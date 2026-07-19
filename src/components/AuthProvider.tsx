"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // On mount, check for existing token
  useEffect(() => {
    const stored = localStorage.getItem("arenamind_token");
    const storedUser = localStorage.getItem("arenamind_user");
    if (stored && storedUser) {
      setToken(stored);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("arenamind_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Redirect to /login if not authenticated and on a dashboard route
  useEffect(() => {
    if (!isLoading && !token && pathname?.startsWith("/dashboard")) {
      router.replace("/login");
    }
  }, [isLoading, token, pathname, router]);

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
