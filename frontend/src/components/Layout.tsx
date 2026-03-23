import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../store/authSlice";

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-500/15 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  ].join(" ");

const links: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/goals", label: "Goals" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[var(--color-surface-muted)] md:block">
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 px-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Budget Planner
            </p>
            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {user?.email}
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[var(--color-surface-muted)] md:hidden">
          <span className="font-semibold text-brand-700 dark:text-brand-400">
            Budget
          </span>
          <button
            type="button"
            className="text-sm text-slate-500"
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
          >
            Log out
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
