import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "~/stores/authStore";

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.profile_completed ? "/catalog" : "/onboarding"}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] p-4">
      <Outlet />
    </div>
  );
}
