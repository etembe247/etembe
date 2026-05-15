"use client";

import { useState, useCallback } from "react";
import { useAppStore, generateId } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, GitFork, Globe } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const login = useAppStore((s) => s.login);
  const signup = useAppStore((s) => s.signup);
  const router = useRouter();

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (mode !== "forgot") {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (mode === "signup") {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (mode === "reset") {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, name, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast.success("Password reset link sent to your email");
        setMode("signin");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          // Create profile in public.profiles
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            name: name,
            username: email.split("@")[0].toLowerCase() + generateId().slice(0, 4),
            avatar_url: "",
            bio: "",
          });
          if (profileError) console.error("Profile creation error:", profileError);
          
          toast.success("Account created! Please check your email for verification.");
          setMode("signin");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    id: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    error?: string,
    rightIcon?: React.ReactNode
  ) => (
    <div className="space-y-1.5">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
          }}
          className={`w-full bg-[var(--muted)] rounded-xl pl-12 pr-${rightIcon ? "12" : "4"} py-3.5 text-sm outline-none transition-all duration-200 border ${
            error
              ? "border-[var(--destructive)] shadow-[0_0_0_3px_rgba(255,59,48,0.1)]"
              : "border-transparent focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)]"
          }`}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="text-[var(--destructive)] text-xs font-medium pl-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-[420px] animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-5 shadow-xl shadow-[var(--primary)]/25">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
            {mode === "reset" && "Set new password"}
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-2">
            {mode === "signin" && "Sign in to continue to ETEMBE"}
            {mode === "signup" && "Join the ETEMBE community"}
            {mode === "forgot" && "Enter your email to receive a reset link"}
            {mode === "reset" && "Choose a new secure password"}
          </p>
        </div>

        {/* Social Login */}
        {(mode === "signin" || mode === "signup") && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  toast("Google sign-in initiated...");
                  // In production, this would redirect to Google OAuth
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] font-medium text-sm hover:bg-[var(--muted)] transition-colors active:scale-[0.97]"
              >
                <Globe className="w-4 h-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  toast("GitHub sign-in initiated...");
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] font-medium text-sm hover:bg-[var(--muted)] transition-colors active:scale-[0.97]"
              >
                <GitFork className="w-4 h-4" />
                GitHub
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" &&
            renderInput(
              "name",
              "text",
              "Full name",
              name,
              setName,
              <User className="w-4 h-4" />,
              errors.name
            )}

          {(mode !== "reset") &&
            renderInput(
              "email",
              "email",
              "Email address",
              email,
              setEmail,
              <Mail className="w-4 h-4" />,
              errors.email
            )}

          {mode !== "forgot" &&
            renderInput(
              "password",
              showPassword ? "text" : "password",
              mode === "reset" ? "New password" : "Password",
              password,
              setPassword,
              <Lock className="w-4 h-4" />,
              errors.password,
              showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
            )}

          {(mode === "signup" || mode === "reset") &&
            renderInput(
              "confirmPassword",
              showPassword ? "text" : "password",
              "Confirm password",
              confirmPassword,
              setConfirmPassword,
              <Lock className="w-4 h-4" />,
              errors.confirmPassword
            )}

          {mode === "signin" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-[var(--primary)] font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[var(--primary)]/30 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
                {mode === "reset" && "Reset Password"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          {mode === "signin" && (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                }}
                className="text-[var(--primary)] font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                }}
                className="text-[var(--primary)] font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrors({});
              }}
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
