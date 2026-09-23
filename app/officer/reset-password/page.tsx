import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function OfficerResetPasswordPage() {
  return (
    <ResetPasswordForm
      title="Set a new officer password"
      loginHref="/officer/login"
      afterResetHref="/officer/login"
    />
  );
}
