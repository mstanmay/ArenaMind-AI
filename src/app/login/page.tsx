"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { m as motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:8000/api/v1";

const BackgroundParticles = memo(() => (
  <>
    {/* Background effects */}
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-[-20%] left-[-15%] h-[700px] w-[700px] rounded-full bg-[#3B82F6]/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] h-[800px] w-[800px] rounded-full bg-[#7C3AED]/8 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] h-[400px] w-[400px] rounded-full bg-[#00E5FF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
    </div>

    {/* Floating shield particles */}
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#00E5FF]/40"
          initial={{ x: `${15 + i * 15}%`, y: `${20 + i * 10}%`, opacity: 0 }}
          animate={{
            y: [`${20 + i * 10}%`, `${10 + i * 8}%`, `${25 + i * 10}%`],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  </>
));

function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

const extractError = (err: any, fallback: string) => {
  if (err?.error?.message) return err.error.message;
  if (typeof err?.detail === 'string') return err.detail;
  if (Array.isArray(err?.detail) && err.detail.length > 0) return err.detail[0].msg;
  if (err?.message) return err.message;
  return fallback;
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Login failed" }));
        setError(extractError(err, "Invalid email or password"));
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const accessToken = data.access_token;

      // Fetch user profile
      const profileRes = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let userData = { id: "", email, full_name: email.split("@")[0], role: "viewer" };
      if (profileRes.ok) {
        userData = await profileRes.json();
      }

      localStorage.setItem("arenamind_token", accessToken);
      localStorage.setItem("arenamind_user", JSON.stringify(userData));

      setSuccess("Authentication successful. Entering command center...");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Cannot connect to backend server. Ensure the API is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Registration failed" }));
        setError(extractError(err, "Registration failed. Try a different email."));
        setIsLoading(false);
        return;
      }

      // Auto-login after successful registration
      setSuccess("Account created! Logging in...");
      setTimeout(async () => {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username: email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          localStorage.setItem("arenamind_token", data.access_token);

          const profileRes = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          let userData = { id: "", email, full_name: fullName, role: "viewer" };
          if (profileRes.ok) {
            userData = await profileRes.json();
          }
          localStorage.setItem("arenamind_user", JSON.stringify(userData));
          router.push("/dashboard");
        }
      }, 600);
    } catch {
      setError("Cannot connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <div className="relative rounded-2xl overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.3)] mb-5 overflow-hidden"
            >
              <Image src="/logo.png" width={64} height={64} className="object-cover" alt="ArenaMind Logo" priority />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading font-bold text-2xl text-white tracking-tight"
            >
              ArenaMind<span className="text-[#00E5FF]">AI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-2"
            >
              {mode === "login" ? "Command Center Access" : "Create Your Account"}
            </motion.p>
          </div>

          {/* Mode toggle */}
          <div className="flex mx-8 rounded-xl bg-white/5 border border-white/5 p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/20"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/20"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="px-8 pb-8 space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="fullname"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required={mode === "register"}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-[#00E5FF]/40 focus:ring-1 focus:ring-[#00E5FF]/20 transition-all font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@arenamind.ai"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-[#00E5FF]/40 focus:ring-1 focus:ring-[#00E5FF]/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-[#00E5FF]/40 focus:ring-1 focus:ring-[#00E5FF]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error/Success messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono"
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-black bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden group"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {mode === "login" ? "Authenticate" : "Create Account"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>

            {/* Demo credentials hint */}
            {mode === "login" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2">Demo Credentials</p>
                <div className="space-y-1 font-mono text-[11px]">
                  <p className="text-gray-500">
                    Email: <button type="button" onClick={() => setEmail("operator@arenamind.ai")} className="text-[#00E5FF] hover:underline cursor-pointer">operator@arenamind.ai</button>
                  </p>
                  <p className="text-gray-500">
                    Pass: <button type="button" onClick={() => setPassword("ComplexSecureP@ss4862")} className="text-[#00E5FF] hover:underline cursor-pointer">ComplexSecureP@ss4862</button>
                  </p>
                </div>
              </motion.div>
            )}
          </form>

          {/* Bottom glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />
        </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#080B14] overflow-hidden">
      <BackgroundParticles />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Static blur container to prevent keystroke re-renders from re-calculating blur */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          <AuthCard />
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-gray-600 mt-6 font-mono tracking-wider"
        >
          ARENAMIND AI v1.0 — ENTERPRISE SECURITY GATEWAY
        </motion.p>
      </motion.div>
    </div>
  );
}
