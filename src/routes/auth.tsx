import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Soltan" },
      { name: "description", content: "Sign in or create an account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "verify";

function AuthPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setPassword("");
    setConfirmPassword("");
    setCode("");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          // No emailRedirectTo → Supabase sends a 6-digit OTP code instead of a magic link
        },
      });
      if (error) throw error;
      toast.success("Code sent", {
        description: "Check your email for a 6-digit verification code.",
      });
      setMode("verify");
    } catch (err: any) {
      toast.error("Sign up failed", { description: err?.message ?? "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "signup",
      });
      if (error) throw error;
      toast.success("Account verified", { description: "Welcome!" });
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error("Verification failed", { description: err?.message ?? "Invalid or expired code." });
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
      if (error) throw error;
      toast.success("Code resent", { description: "Check your inbox." });
    } catch (err: any) {
      toast.error("Could not resend", { description: err?.message ?? "Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (err: any) {
      const msg = err?.message ?? "Something went wrong.";
      toast.error("Sign in failed", {
        description: msg.includes("Email not confirmed")
          ? "Please verify your email first — check your inbox for the code."
          : msg,
      });
      if (msg.includes("Email not confirmed")) setMode("verify");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-border bg-background px-3 py-2 text-sm focus:border-ink focus:outline-none";
  const labelClass = "mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground";
  const buttonClass =
    "w-full bg-ink py-4 text-[10px] uppercase tracking-[0.2em] text-marble transition-opacity hover:opacity-90 disabled:opacity-50";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16 md:py-24">
        <span className="eyebrow">{t("auth.account")}</span>
        <h1 className="mt-4 font-serif text-4xl">
          {mode === "login" ? t("auth.signin") : mode === "signup" ? t("auth.create") : t("auth.verify")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "login" && t("auth.signinSub")}
          {mode === "signup" && t("auth.signupSub")}
          {mode === "verify" && t("auth.verifySub")}
        </p>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-10 space-y-4">
            <div>
              <label className={labelClass}>{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? t("auth.please") : t("auth.signin")}
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup} className="mt-10 space-y-4">
            <div>
              <label className={labelClass}>{t("auth.fullName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("auth.confirmPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? t("auth.please") : t("auth.create")}
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={handleVerify} className="mt-10 space-y-4">
            <div>
              <label className={labelClass}>{t("auth.code")}</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
                placeholder="------"
              />
            </div>
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? t("auth.verifying") : t("auth.verifyContinue")}
            </button>
            <button
              type="button"
              onClick={resendCode}
              disabled={submitting}
              className="w-full pt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink disabled:opacity-50"
            >
              {t("auth.resend")}
            </button>
          </form>
        )}

        {mode !== "verify" && (
          <button
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="mt-6 w-full border-b border-border pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
          >
            {mode === "login" ? t("auth.needAccount") : t("auth.haveAccount")}
          </button>
        )}

        {mode === "verify" && (
          <button
            onClick={() => switchMode("signup")}
            className="mt-6 w-full border-b border-border pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
          >
            {t("auth.diffEmail")}
          </button>
        )}

        <Link
          to="/"
          className="mt-8 block text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
        >
          {t("auth.back")}
        </Link>
      </main>
    </div>
  );
}
