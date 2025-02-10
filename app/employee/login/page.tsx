"use client";

import { LoginForm } from "@/components/auth/login-form";

export default function EmployeeLoginPage() {
  return (
    <LoginForm
      type="employee"
      title="Employee Login"
      subtitle="Sign in to your employee account"
      redirectPath="/employee/dashboard"
      registerPath="/employee/register"
    />
  );
}