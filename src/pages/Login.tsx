import { useState, useRef } from "react";

import { MailIcon } from "../components/icons/MailIcon";
import { ArrowRightIcon } from "../components/icons/ArrowRightIcon";
import { ShieldIcon } from "../components/icons/ShieldIcon";
import { BuildingIcon } from "../components/icons/BuildingIcon";
import { InputOtp } from "primereact/inputotp";
import { useAuth, getRoleHomeRoute } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  email: string;
  password: string;
  otp: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  otp?: string;
}

// EMAIL  → collect email, local validation only, no network call
// PASSWORD → POST /auth/login; backend decides if OTP is needed
// OTP    → POST /auth/verify-otp; completes login for 2FA accounts
type Step = "EMAIL" | "PASSWORD" | "OTP";

export type ColumnType<T> = {
  field: keyof T;
  header: string;
  body?: (row: T) => React.ReactNode;
};

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-card border-r border-border">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary text-primary-foreground flex-center">
          <BuildingIcon />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">VendorSync</h1>
          <p className="text-sm text-muted-foreground">
            Vendor Management Platform
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-bold leading-tight text-foreground">
          Manage vendors
          <br />
          from one place
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          Streamline onboarding, procurement, compliance, and vendor operations
          with a centralized platform.
        </p>
        <div className="mt-8 space-y-4">
          {[
            "Vendor onboarding",
            "Compliance management",
            "Procurement analytics",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-sm text-foreground"
            >
              <div className="text-primary">
                <ShieldIcon />
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Trusted by enterprise procurement teams.
      </p>
    </div>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("EMAIL");
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // otpToken is kept in a ref — it's not displayed anywhere,
  // so it doesn't need to trigger re-renders. Keeps it out of
  // React state and slightly harder to accidentally log/expose.
  const otpTokenRef = useRef<string>("");

  // ── Field helpers ──────────────────────────────────────

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Clears both inline field errors and the top-level form error
  // before each submission attempt.
  const resetErrors = () => {
    setErrors({});
    setFormError(null);
  };

  // ── Validators ─────────────────────────────────────────

  const validateEmail = (): FormErrors => {
    if (!form.email.trim()) return { email: "Email is required" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return { email: "Enter a valid email address" };
    return {};
  };

  const validatePassword = (): FormErrors => {
    if (!form.password) return { password: "Password is required" };
    return {};
  };

  const validateOtp = (): FormErrors => {
    if (!form.otp) return { otp: "Verification code is required" };
    if (form.otp.length !== 6) return { otp: "Code must be 6 digits" };
    return {};
  };

  const handleContinueWithEmail = () => {
    resetErrors();
    const validation = validateEmail();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    setStep("PASSWORD");
  };

  const handleLoginWithPassword = async () => {
    resetErrors();
    const validation = validatePassword();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const result = await auth.login(form.email, form.password);

      if (result.requiresOtp) {
        otpTokenRef.current = result.otpToken;
        setStep("OTP");
        return;
      }

      // 2FA not enabled — login is fully complete. Navigate now.
      navigate(getRoleHomeRoute(result.user.role?.name));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    resetErrors();
    const validation = validateOtp();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const result = await auth.verifyOtp(otpTokenRef.current, form.otp);
      navigate(getRoleHomeRoute(result.user.role?.name));
    } catch (err) {
      // Clear the entered code on failure so the user doesn't retry
      // the same wrong value — a subtle but important UX detail.
      setForm((prev) => ({ ...prev, otp: "" }));
      setFormError(
        err instanceof Error ? err.message : "Invalid or expired code",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetErrors();
    setLoading(true);
    try {
      const result = await auth.resendOtp(otpTokenRef.current);
      otpTokenRef.current = result.otpToken;
      setForm((prev) => ({ ...prev, otp: "" }));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not resend code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <LeftPanel />

      <div className="flex-1 flex-center p-6">
        <div className="card w-full max-w-md p-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex-center">
              <BuildingIcon />
            </div>
            <div>
              <h1 className="font-bold text-foreground">VendorSync</h1>
              <p className="text-xs text-muted-foreground">Vendor Management</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your procurement workspace
            </p>
          </div>

          {/* Top-level error */}
          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {formError}
            </div>
          )}

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5"
            noValidate
          >
            {/* ── Email field (always visible, locked after step 1) ── */}
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
                  value={form.email}
                  disabled={step !== "EMAIL"}
                  autoComplete="email"
                  onChange={setField("email")}
                  className="w-full h-11 pl-10 pr-4 rounded-md border border-border disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>

            {/* ── Password field (steps PASSWORD + OTP) ── */}
            {(step === "PASSWORD" || step === "OTP") && (
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  autoFocus={step === "PASSWORD"}
                  // Locked once we're on the OTP step — both factors
                  // are visible but only the current one is editable.
                  disabled={step === "OTP"}
                  autoComplete="current-password"
                  onChange={setField("password")}
                  className="w-full h-11 px-4 rounded-md border border-border disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password}</p>
                )}
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    state={{ email: form.email }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            )}

            {/* ── OTP field (2FA accounts only) ── */}
            {step === "OTP" && (
              <div>
                <label className="block mb-3 text-sm font-medium text-foreground">
                  Verification Code
                </label>

                <div className="flex justify-center">
                  <InputOtp
                    value={form.otp}
                    onChange={(e: any) =>
                      setForm((prev) => ({ ...prev, otp: e.value ?? "" }))
                    }
                    integerOnly
                    length={6}
                    autoFocus
                  />
                </div>

                {errors.otp && (
                  <p className="mt-2 text-xs text-danger text-center">
                    {errors.otp}
                  </p>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Code sent to {form.email}
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="mt-2 w-full text-primary text-sm hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            )}

            {/* ── Primary CTA — changes per step ── */}
            {step === "EMAIL" && (
              <button
                type="submit"
                onClick={handleContinueWithEmail}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2"
              >
                Continue
                <ArrowRightIcon />
              </button>
            )}

            {step === "PASSWORD" && (
              <button
                type="submit"
                onClick={handleLoginWithPassword}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  "Signing in…"
                ) : (
                  <>
                    {" "}
                    Sign In <ArrowRightIcon />{" "}
                  </>
                )}
              </button>
            )}

            {step === "OTP" && (
              <button
                type="submit"
                onClick={handleVerifyOtp}
                disabled={loading || form.otp.length !== 6}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  "Verifying…"
                ) : (
                  <>
                    {" "}
                    Verify Code <ArrowRightIcon />{" "}
                  </>
                )}
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 flex gap-3 rounded-lg border border-border bg-muted p-4">
            <div className="text-muted-foreground">
              <ShieldIcon />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Protected with enterprise-grade security and compliance standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
