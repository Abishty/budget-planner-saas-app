import { useMutation, useQuery } from "@apollo/client";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  CREATE_TRANSACTION,
  DELETE_TRANSACTION,
  TRANSACTIONS,
} from "../graphql/operations";
import { useAppSelector } from "../hooks";
import { formatDate, formatMoney } from "../lib/format";
import type { CategoryRow, TransactionRow } from "../types/api";

export function Transactions() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "USD");
  const { data: catData } = useQuery(CATEGORIES);
  const { data, loading, refetch } = useQuery(TRANSACTIONS, {
    variables: { limit: 100 },
  });

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");

  const filteredCategories = useMemo(() => {
    const list = catData?.categories ?? [];
    return list.filter((c: CategoryRow) => c.type === type);
  }, [catData, type]);

  const [createTx, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    onCompleted: () => {
      void refetch();
      setAmount("");
      setDescription("");
    },
  });

  const [deleteTx] = useMutation(DELETE_TRANSACTION, {
    onCompleted: () => void refetch(),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) return;
    void createTx({
      variables: {
        input: {
          amount: n,
          description: description.trim() || undefined,
          date: new Date(date).toISOString(),
          type,
          categoryId: categoryId || undefined,
        },
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Transactions
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Record income and expenses
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Add transaction
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as "EXPENSE" | "INCOME");
                setCategoryId("");
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="">None</option>
              {filteredCategories.map((c: CategoryRow) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            placeholder="Optional"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {creating ? "Saving…" : "Add transaction"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent activity
          </h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {(data?.transactions ?? []).map((t: TransactionRow) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 px-6 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {t.description || (t.type === "INCOME" ? "Income" : "Expense")}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(t.date)}
                    {t.category ? ` · ${t.category.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      t.type === "INCOME"
                        ? "font-semibold text-brand-700 dark:text-brand-400"
                        : "font-semibold text-slate-900 dark:text-white"
                    }
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {formatMoney(t.amount, currency)}
                  </span>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                    onClick={() => void deleteTx({ variables: { id: t.id } })}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && (data?.transactions ?? []).length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No transactions yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
