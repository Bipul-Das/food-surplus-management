// client/src/components/auth/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  
  // Next.js hydration safeguard
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run auth checks after the component has mounted and Zustand has hydrated
    if (isMounted) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        return;
      }

      // 👑 GOD MODE CHECK
      if (user.role === "LEAD_DEV") return;

      // Check Specific Role Permissions
      if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized"); // 403 Forbidden
      }
    }
  }, [isMounted, user, isAuthenticated, allowedRoles, router]);

  // Prevent UI flickering while Next.js mounts and Zustand loads from storage
  if (!isMounted || !isAuthenticated || !user || (!allowedRoles.includes(user.role) && user.role !== "LEAD_DEV")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
          <p className="text-gray-500 font-medium">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  // Render the Protected Content
  return <>{children}</>;
}