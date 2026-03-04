// client/src/components/auth/ProtectedRoute.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ["DONOR", "COORDINATOR"]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Check Authentication
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // 2. 👑 GOD MODE CHECK
    // Lead Developer bypasses all role checks
    if (user.role === "LEAD_DEV") {
      setIsAuthorized(true);
      return;
    }

    // 3. Check Specific Role Permissions
    if (allowedRoles.includes(user.role)) {
      setIsAuthorized(true);
    } else {
      // User is logged in but trying to access a restricted page
      // e.g., Donor trying to access Coordinator Dashboard
      router.push("/unauthorized"); // We will build this 403 page later
    }
  }, [user, isAuthenticated, allowedRoles, router]);

  // 4. Loading State (Prevent UI Flicker)
  // While we are checking permissions, show a professional spinner
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
          <p className="text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // 5. Render the Protected Content
  return <>{children}</>;
}