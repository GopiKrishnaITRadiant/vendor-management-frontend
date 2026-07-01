import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailIcon } from "../components/icons/MailIcon";
import { ShieldIcon } from "../components/icons/ShieldIcon";
import { BuildingIcon } from "../components/icons/BuildingIcon";
import { authApi } from "../api/client";
import { forgotPassword } from "../services/authService";

type Stage = "FORM" | "SENT";

export default function ForgotPassword() {
  const location = useLocation();

  const prefillEmail =
    (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [stage, setStage] = useState<Stage>("FORM");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await forgotPassword(email);
    //   Always advance to SENT regardless of whether the email exists.
    //   The backend returns the same generic message either way — this
    //   prevents user enumeration (attacker can't tell if an email is
    //   registered by watching the UI behaviour).
      if(!data) throw new Error("Failed to forgot password");

      setStage("SENT");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-center bg-background p-6">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex-center">
            <BuildingIcon />
          </div>
          <div>
            <h1 className="font-bold text-foreground">VendorSync</h1>
            <p className="text-xs text-muted-foreground">Vendor Management</p>
          </div>
        </div>

        {stage === "FORM" ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the email address tied to your account and we'll send you
                a reset link.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => e.preventDefault()}
              noValidate
              className="space-y-5"
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Business Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    placeholder="vendor@company.com"
                    value={email}
                    autoFocus
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-md border border-border"
                  />
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2 disabled:opacity-70"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          // ── SENT stage ───────────────────────────────────
          // Generic confirmation — never tell the user whether the
          // email was registered or not (anti-enumeration).
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex-center mx-auto text-primary">
              <MailIcon />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Check your inbox
            </h2>
            <p className="text-sm text-muted-foreground">
              If <span className="font-medium text-foreground">{email}</span> is
              registered, you'll receive a reset link shortly. Check your spam
              folder if it doesn't arrive within a few minutes.
            </p>
            <p className="text-xs text-muted-foreground">
              The link expires in <span className="font-medium">1 hour</span>.
            </p>
          </div>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            ← Back to sign in
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 rounded-lg border border-border bg-muted p-4">
          <div className="text-muted-foreground">
            <ShieldIcon />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Reset links are single-use and expire after 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}
