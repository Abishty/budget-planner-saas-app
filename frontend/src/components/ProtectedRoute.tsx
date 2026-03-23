import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";

export function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  const hydrated = useAppSelector((s) => s.auth.hydrated);

  if (!token) return <Navigate to="/login" replace />;
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[var(--color-surface)]">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }
  return <Outlet />;
}
