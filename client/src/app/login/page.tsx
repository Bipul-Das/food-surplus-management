// client/src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/api";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Input } from "@/components/ui/Input";   // UPGRADED: Using Phase 2 Atomic Input
import { Button } from "@/components/ui/Button"; // UPGRADED: Using Phase 2 Atomic Button
import toast from "react-hot-toast";
import Logo from "@/components/common/Logo";

// 1. Strict Zod Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Submit Handler (Logic preserved exactly as requested)
  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;

      login(user, token);
      toast.success("Login successful");

      const rolePath = user.role === "LEAD_DEV" ? "admin" : user.role.toLowerCase();
      router.push(`/dashboard/${rolePath}`);
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials or server error.";
      setGlobalError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 flex flex-col items-center justify-center">

        {/* DESIGN UPGRADE: Spacing and Typography */}
        <Logo iconSize="lg" className="mb-4 justify-center" />
        <p className="text-[16px] text-gray-500 font-medium tracking-tight">
          Secure operational access portal.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* DESIGN UPGRADE: Using saas-card class for soft corners and smooth shadows */}
        <FloatingCard className="saas-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., dev@project.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password?.message}
            />

            {/* DESIGN UPGRADE: Enterprise-style error alerting */}
            {globalError && (
              <div className="text-sm font-semibold text-semantic-danger bg-semantic-danger/10 p-4 rounded-xl border border-semantic-danger/20 animate-in fade-in slide-in-from-top-1">
                {globalError}
              </div>
            )}

            {/* DESIGN UPGRADE: Using Atomic Button with cinematic lift and loading state */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Secure Login
            </Button>

          </form>
        </FloatingCard>

        {/* FOOTER: Subtle professional touch */}
        <p className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
          Enterprise Security Protocol v4.0
        </p>
      </div>
    </div>
  );
}