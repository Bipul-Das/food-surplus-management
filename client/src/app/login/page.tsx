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
import { GoogleStyleInput } from "@/components/ui/GoogleStyleInput";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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

  // 2. Submit Handler
  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;
      
      // Update global Zustand store
      login(user, token);
      toast.success("Login successful");
      
      // Route based on role
      const rolePath = user.role === "LEAD_DEV" ? "admin" : user.role.toLowerCase();
      router.push(`/dashboard/${rolePath}`);
    } catch (error: any) {
      // Handle 401 Unauthorized securely
      const message = error.response?.data?.message || "Invalid credentials or server error.";
      setGlobalError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-brand-dark">
          Food<span className="text-brand-blue">Surplus</span>
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Secure operational access portal.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <FloatingCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <GoogleStyleInput
              label="Email Address"
              type="email"
              placeholder="e.g., dev@project.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <GoogleStyleInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password?.message}
            />

            {/* Inline Global Error (e.g., Wrong Password) */}
            {globalError && (
              <div className="text-sm font-medium text-urgency-high bg-red-50 p-3 rounded-md border border-red-100">
                {globalError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Secure Login"}
            </button>
          </form>
        </FloatingCard>
      </div>
    </div>
  );
}