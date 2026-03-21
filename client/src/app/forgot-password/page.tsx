// client/src/app/forgot-password/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await api.post("/auth/forgot-password", data);

      // Strict generic success message to prevent user tracking
      toast.success("If an account exists, a new password has been sent to your email.", {
        duration: 5000,
      });

      reset();
      // Route back to login to utilize the new credentials
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      // Even on a server failure, we keep the UI clean
      toast.error("An error occurred connecting to the server. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-blue/5 -z-10 [clip-path:polygon(0_0,100%_0,100%_100%,0_80%)]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-6 relative">
            <KeyRound className="w-8 h-8 text-brand-blue" />
            <div className="absolute -bottom-2 -right-2 bg-semantic-success rounded-full p-1 border-2 border-white">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-brand-dark tracking-tight">
            Credential Recovery
          </h2>
          <p className="mt-3 text-[15px] font-medium text-gray-500 px-4">
            Enter your registered official email address to receive a system-generated secure key.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-cinematic border-gray-200/60 backdrop-blur-sm bg-white/95">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              <div className="space-y-1">
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g., contact@organization.com"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-[15px] tracking-wide shadow-md"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Transmit Secure Key
                </Button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-[14px] font-bold text-gray-500 hover:text-brand-blue transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Return to Secure Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Protected by End-to-End Encryption
          </p>
        </div>

      </div>
    </div>
  );
}