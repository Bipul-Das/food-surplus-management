// client/src/app/forgot-password/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GoogleStyleInput } from "@/components/ui/GoogleStyleInput";
import { Loader2, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-brand-dark">
          Credential Recovery
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your registered email address to receive a system-generated password.
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Send New Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-brand-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to secure login
            </Link>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}