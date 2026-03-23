import { useMutation, useQuery } from "@apollo/client";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  BUDGETS,
  CATEGORIES,
  CREATE_BUDGET,
  CREATE_CATEGORY,
} from "../graphql/operations";
import { useAppSelector } from "../hooks";
import { formatDate, formatMoney } from "../lib/format";
import type { BudgetRow, CategoryRow } from "../types/api";

export function Budgets() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "USD");
  const { data: catData, refetch: refetchCats } = useQuery(CATEGORIES);
  const { data, loading, refetch } = useQuery(BUDGETS);

  const expenseCategories =
    catData?.categories.filter((c: CategoryRow) => c.type === "EXPENSE") ?? [];

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [newCatName, setNewCatName] = useState("");

  const [createCategory, { loading: creatingCat }] = useMutation(
    CREATE_CATEGORY,
    {
      onCompleted: () => {
        void refetchCats();
        setNewCatName("");
      },
    }
  );

  const [createBudget, { loading: creating }] = useMutation(CREATE_BUDGET, {
    onCompleted: () => {
      void refetch();
      setAmount("");
      setCategoryId("");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!categoryId || Number.isNaN(n) || n <= 0) return;
    void createBudget({
      variables: {
        categoryId,
        amount: n,
        period,
        startDate: new Date().toISOString(),
      },
    });
  }

  function onCreateCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    void createCategory({
      variables: { name, type: "EXPENSE", color: "#22c55e" },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Budgets
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Set limits per category
        </p>
      </div>

      {expenseCategories.length === 0 ? (
        <form
          onSubmit={onCreateCategory}
          className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-600 dark:bg-[var(--color-surface-muted)]"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Add an expense category first
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Budgets are tied to categories. Create one to get started.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="e.g. Groceries"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
            <button
              type="submit"
              disabled={creatingCat}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-600"
            >
              {creatingCat ? "Adding…" : "Add category"}
            </button>
          </div>
        </form>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          New budget
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="">Select…</option>
              {expenseCategories.map((c: CategoryRow) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Period
            </label>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as "MONTHLY" | "YEARLY")
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={creating || expenseCategories.length === 0}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {creating ? "Saving…" : "Create budget"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Your budgets
          </h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {(data?.budgets ?? []).map((b: BudgetRow) => (
              <li key={b.id} className="px-6 py-4">
                <p className="font-medium text-slate-900 dark:text-white">
                  {b.category.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {b.period === "MONTHLY" ? "Monthly" : "Yearly"} · starts{" "}
                  {formatDate(b.startDate)}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatMoney(b.amount, currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {!loading && (data?.budgets ?? []).length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No budgets yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
