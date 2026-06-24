import { useState } from "react";

import { MailIcon } from "../components/icons/MailIcon";
import { ArrowRightIcon } from "../components/icons/ArrowRightIcon";
import { ShieldIcon } from "../components/icons/ShieldIcon";
import { BuildingIcon } from "../components/icons/BuildingIcon";
import { InputOtp } from "primereact/inputotp";
import { useAuth, getRoleHomeRoute } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface FormState {
  email: string;
  otp: string;
  password: string;
}

interface FormErrors {
  email?: string;
  otp?: string;
  password?: string;
}

export type ColumnType<T> = {
  field: keyof T;
  header: string;
  body?: (row: T) => React.ReactNode;
};

function LeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-card border-r border-border">
      {/* Logo */}
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

      {/* Content */}
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

      {/* Footer */}
      <p className="text-sm text-muted-foreground">
        Trusted by enterprise procurement teams.
      </p>
    </div>
  );
}

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    email: "",
    otp: "",
    password: "",
  });
  const [otpToken, setOtpToken] = useState("");

  // EMAIL -> OTP -> PASSWORD -> (dashboard via navigate)
  const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD">("EMAIL");

  const [errors, setErrors] = useState<FormErrors>({});

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = () => {
    if (!form.email.trim()) {
      return {
        email: "Email is required",
      };
    }

    return {};
  };

  const validateOtp = () => {
    if (!form.otp) {
      return {
        otp: "OTP is required",
      };
    }

    if (form.otp.length !== 6) {
      return {
        otp: "OTP must be 6 digits",
      };
    }

    return {};
  };

  const validatePassword = () => {
    if (!form.password) {
      return {
        password: "Password is required",
      };
    }

    return {};
  };

  const handleSendOtp = async () => {
    const validation = validateEmail();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      const data = await auth.sendOtp(form.email);
      setOtpToken(data.otpToken);
      setStep("OTP");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const validation = validateOtp();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      // Confirms the OTP only — does not log the user in.
      await auth.verifyOtp(otpToken, form.otp);
      setStep("PASSWORD");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithPassword = async () => {
    const validation = validatePassword();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setFormError(null);
    setLoading(true);

    try {
      // Identity already confirmed via OTP, so this should resolve
      // directly to a session rather than asking for OTP again.
      const result = await auth.login(form.email, form.password);
      console.log('result', result);
      
      if (result.requiresOtp) {
        // Defensive fallback — shouldn't normally happen since we
        // just verified OTP, but handle it gracefully if the backend
        // disagrees (e.g. OTP confirmation expired).
        setOtpToken(result.otpToken);
        setStep("OTP");
        setFormError(result.message ?? "Please verify the OTP again");
        return;
      }

      navigate(getRoleHomeRoute(result.user.role?.name));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left */}
      <LeftPanel />

      {/* Right */}
      <div className="flex-1 flex-center p-6">
        <div className="card w-full max-w-md p-8">
          {/* Mobile Logo */}
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

          {formError && (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {/* Email */}
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
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-md border border-border"
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>

            {/* OTP */}
            {step === "OTP" && (
              <div>
                <label className="block mb-3 text-sm font-medium text-foreground">
                  Verification Code
                </label>

                <div className="flex justify-center">
                  <InputOtp
                    value={form.otp}
                    onChange={(e: any) =>
                      setForm((prev) => ({
                        ...prev,
                        otp: e.value ?? "",
                      }))
                    }
                    integerOnly
                    length={6}
                  />
                </div>

                {errors.otp && (
                  <p className="mt-2 text-xs text-danger text-center">
                    {errors.otp}
                  </p>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  OTP sent to {form.email}
                </p>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="mt-2 w-full text-primary text-sm"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* Password — shown after OTP is verified */}
            {step === "PASSWORD" && (
              <div>
                <label className="block mb-2 text-sm font-medium text-foreground">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  autoFocus
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-4 rounded-md border border-border"
                />

                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password}</p>
                )}

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Verified as {form.email}
                </p>
              </div>
            )}

            {/* Button */}
            {step === "EMAIL" && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2"
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Send OTP
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            )}

            {step === "OTP" && (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify OTP
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            )}

            {step === "PASSWORD" && (
              <button
                type="button"
                onClick={handleLoginWithPassword}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex-center gap-2"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon />
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