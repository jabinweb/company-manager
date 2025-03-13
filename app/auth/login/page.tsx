'use client';

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <LoginForm
      type="user"
      title="User Login"
      subtitle="Sign in to your account"
      redirectPath="/dashboard"
      registerPath="/register"
    />
  );
}