import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ApplicantResetPasswordPage() {
  return (
    <ResetPasswordForm
      title="Set a new password"
      loginHref="/applicant/login"
      afterResetHref="/applicant/login"
    />
  );
}
