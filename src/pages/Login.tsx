import { useState } from "react";

import { MailIcon } from "../components/icons/MailIcon";
import { ArrowRightIcon } from "../components/icons/ArrowRightIcon";
import { ShieldIcon } from "../components/icons/ShieldIcon";
import { BuildingIcon } from "../components/icons/BuildingIcon";
import { InputOtp } from "primereact/inputotp";

interface FormState {
  email: string;
  otp: string;
}

interface FormErrors {
  email?: string;
  otp?: string;
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
  const [form, setForm] = useState<FormState>({
    email: "",
    otp: "",
  });

  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
  }>({});

  const [loading, setLoading] = useState(false);

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

  const handleSendOtp = async () => {
    const validation = validateEmail();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    try {
      // await api.sendOtp(form.email);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep("OTP");
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

    setLoading(true);

    try {
      // await api.verifyOtp({
      //   email: form.email,
      //   otp: form.otp,
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Login Success");
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
                  disabled={step === "OTP"}
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
                    onChange={(e:any) =>
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
                  className="mt-2 w-full text-primary text-sm"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* Button */}
            {step === "EMAIL" ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="
        w-full
        h-11
        rounded-md
        bg-primary
        text-primary-foreground
        font-medium
        flex-center
        gap-2
      "
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
            ) : (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="
        w-full
        h-11
        rounded-md
        bg-primary
        text-primary-foreground
        font-medium
        flex-center
        gap-2
      "
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Login
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
