import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldIcon } from "../components/icons/ShieldIcon";
import { BuildingIcon } from "../components/icons/BuildingIcon";
import { resetPassword } from "../services/authService";

type Stage = "FORM" | "SUCCESS" | "INVALID";

// Password rules — keep in sync with your backend DTO validation.
const PASSWORD_RULES = {
  minLength: 6,
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
};

function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= PASSWORD_RULES.minLength) score++;
  if (PASSWORD_RULES.hasUpper.test(password)) score++;
  if (PASSWORD_RULES.hasLower.test(password)) score++;
  if (PASSWORD_RULES.hasNumber.test(password)) score++;
  if (PASSWORD_RULES.hasSpecial.test(password)) score++;

  const map = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-danger" },
    { label: "Fair", color: "bg-warning" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-success" },
    { label: "Very strong", color: "bg-success" },
  ];

  return { score, ...map[score] };
}

interface FormState {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The token comes from the URL: /reset-password?token=xxx
  const token = searchParams.get("token") ?? "";

  const [stage, setStage] = useState<Stage>(token ? "FORM" : "INVALID");
  const [form, setForm] = useState<FormState>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.newPassword);

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      const updatedForm = {
        ...form,
        [field]: value,
      };

      setForm(updatedForm);
      setErrors(validate(updatedForm));
      setError(null);
    };

  const validate = (values: FormState): FormErrors => {
    const errs: FormErrors = {};

    if (!values.newPassword) {
      errs.newPassword = "Password is required";
    } else if (values.newPassword.length < PASSWORD_RULES.minLength) {
      errs.newPassword = `Password must be at least ${PASSWORD_RULES.minLength} characters`;
    } else if (getPasswordStrength(values.newPassword).score < 3) {
      errs.newPassword =
        "Password is too weak — add uppercase, numbers, or symbols";
    }

    if (!values.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (values.newPassword !== values.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleSubmit = async () => {
    setError(null);
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword: form.newPassword });
      if (!res) throw new Error("Failed to reset password");

      setStage("SUCCESS");
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

        {/* ── INVALID: no token or expired ── */}
        {stage === "INVALID" && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-danger/10 flex-center mx-auto text-danger text-2xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-bold text-foreground">Link expired</h2>
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has already been used. Reset links
              expire after 1 hour and can only be used once.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              Request a new reset link →
            </Link>
          </div>
        )}

        {/* ── FORM ── */}
        {stage === "FORM" && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Set new password
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a strong password you haven't used before.
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
              {/* New password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.newPassword}
                  autoFocus
                  autoComplete="new-password"
                  onChange={setField("newPassword")}
                  className="w-full h-11 px-4 rounded-md border border-border"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.newPassword}
                  </p>
                )}

                {/* Password strength bar */}
                {form.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            strength.score >= n ? strength.color : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className="text-xs text-muted-foreground">
                        Strength:{" "}
                        <span className="font-medium text-foreground">
                          {strength.label}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={form.confirmPassword}
                  autoComplete="new-password"
                  onChange={setField("confirmPassword")}
                  className="w-full h-11 px-4 rounded-md border border-border"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2 disabled:opacity-70"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS ── */}
        {stage === "SUCCESS" && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex-center mx-auto text-primary">
              <ShieldIcon />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Password updated
            </h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground font-medium"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Back link — only on FORM stage */}
        {stage === "FORM" && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              ← Back to sign in
            </Link>
          </div>
        )}

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
