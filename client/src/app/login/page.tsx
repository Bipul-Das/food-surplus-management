// client/src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/api";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import toast from "react-hot-toast";
import Logo from "@/components/common/Logo";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-background relative overflow-hidden font-sans">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-blue/5 -z-10 [clip-path:polygon(0_0,100%_0,100%_100%,0_80%)]" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Logo iconSize="lg" className="mb-4 justify-center" />
        <p className="text-[16px] text-gray-500 font-medium tracking-tight">
          Secure operational access portal.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
        <Card className="shadow-cinematic border-gray-200/60 backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              <div className="space-y-1">
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g., dev@project.com"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div className="space-y-1">
                {/* LEAD DEV FIX: Custom label arrangement for the Forgot Password link */}
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Security Key
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-bold text-brand-blue hover:text-brand-dark transition-colors"
                  >
                    Forgot Key?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your secure password"
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>

              {globalError && (
                <div className="flex items-start gap-3 text-sm font-bold text-semantic-danger bg-red-50/50 p-4 rounded-xl border border-semantic-danger/20 animate-in fade-in slide-in-from-top-2">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{globalError}</p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full text-[15px] tracking-wide shadow-md"
                >
                  Establish Secure Connection
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-blue" />
          Enterprise Security Protocol v4.0
        </p>
      </div>
    </div>
  );
}