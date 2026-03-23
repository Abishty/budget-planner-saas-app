import { useMutation } from "@apollo/client";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LOGIN } from "../graphql/operations";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setCredentials } from "../store/authSlice";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const hydrated = useAppSelector((s) => s.auth.hydrated);

  if (token && hydrated) return <Navigate to="/" replace />;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      dispatch(
        setCredentials({
          token: data.login.token,
          user: data.login.user,
        })
      );
      navigate("/", { replace: true });
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    void login({ variables: { email, password } });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 dark:bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Budget Planner SaaS
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
