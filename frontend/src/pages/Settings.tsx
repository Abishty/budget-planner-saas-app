import { useMutation } from "@apollo/client";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { UPDATE_PROFILE } from "../graphql/operations";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../store/authSlice";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;

export function Settings() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [name, setName] = useState(user?.name ?? "");
  const [currency, setCurrency] = useState(user?.currency ?? "USD");
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setCurrency(user.currency);
      setDarkMode(user.darkMode);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      dispatch(setUser(data.updateProfile));
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void updateProfile({
      variables: {
        name: name.trim() || null,
        currency,
        darkMode,
      },
    });
  }

  if (!user) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Profile and display preferences
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Display name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-600"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Dark mode
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
