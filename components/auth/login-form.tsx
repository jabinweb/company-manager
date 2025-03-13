'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginInput } from "@/lib/validations/auth"; // Use LoginInput instead of LoginFormData
import type { ValidationIssue } from '@/types/auth';
import { useRouter } from 'next/navigation'; // Changed from 'next/router'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  type: 'user' | 'employee';
  title: string;
  subtitle: string;
  redirectPath: string;
  registerPath: string;
}

export function LoginForm({ type, title, subtitle, redirectPath, registerPath }: LoginFormProps) {
  const { login } = useSession();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginInput>({  // Use LoginInput type
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      isEmployee: type === 'employee'
    }
  });

  async function onSubmit(data: LoginInput) {
    try {
      console.log('[Login Form] Submitting:', { email: data.email });
      setError(null);
      form.clearErrors();
      
      const result = await login(data);
      console.log('[Login Form] Login result:', {
        success: result.success,
        hasError: Boolean(result.error),
        hasIssues: Boolean(result.issues)
      });
      
      if (result.success && result.redirectTo) {
        // Use router.push instead of router.replace for better UX
        router.push(result.redirectTo);
      } else {
        if (result.issues && result.issues.length > 0) {
          console.log('[Login Form] Validation issues:', result.issues);
          result.issues.forEach((issue: ValidationIssue) => {
            const field = issue.path[0] as keyof LoginInput;
            form.setError(field, { message: issue.message });
          });
          return;
        }
        console.error('[Login Form] Login failed:', result.error);
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      console.error('[Login Form] Submit error:', {
        error: err instanceof Error ? {
          message: err.message,
          stack: err.stack
        } : err,
        formData: { email: data.email }
      });
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
            // Prevent default form submission
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }
            }}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email address"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href={registerPath} className="text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}