import { useMutation, useQuery } from "@apollo/client";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  CREATE_GOAL,
  GOALS,
  UPDATE_GOAL_CURRENT,
} from "../graphql/operations";
import { useAppSelector } from "../hooks";
import { formatDate, formatMoney } from "../lib/format";
import type { GoalRow } from "../types/api";

export function Goals() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "USD");
  const { data, loading, refetch } = useQuery(GOALS);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const [createGoal, { loading: creating }] = useMutation(CREATE_GOAL, {
    onCompleted: () => {
      void refetch();
      setName("");
      setTargetAmount("");
      setDeadline("");
    },
  });

  const [updateCurrent] = useMutation(UPDATE_GOAL_CURRENT, {
    onCompleted: () => void refetch(),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(targetAmount);
    if (!name.trim() || Number.isNaN(n) || n <= 0) return;
    void createGoal({
      variables: {
        name: name.trim(),
        targetAmount: n,
        deadline: deadline
          ? new Date(deadline).toISOString()
          : undefined,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Goals
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Savings targets and progress
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          New goal
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              placeholder="Emergency fund"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Target amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {creating ? "Saving…" : "Create goal"}
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          (data?.goals ?? []).map((g: GoalRow) => {
            const pct = Math.min(
              100,
              (g.currentAmount / Math.max(g.targetAmount, 1)) * 100
            );
            return (
              <div
                key={g.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {g.name}
                    </h3>
                    {g.deadline ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Due {formatDate(g.deadline)}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-right text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatMoney(g.currentAmount, currency)}
                    </span>
                    {" / "}
                    {formatMoney(g.targetAmount, currency)}
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <form
                  className="mt-4 flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const el = (
                      e.currentTarget.elements.namedItem(
                        "current"
                      ) as HTMLInputElement
                    );
                    const v = Number(el.value);
                    if (Number.isNaN(v) || v < 0) return;
                    void updateCurrent({
                      variables: { id: g.id, currentAmount: v },
                    });
                    el.value = "";
                  }}
                >
                  <div>
                    <label className="block text-xs text-slate-500">
                      Update saved amount
                    </label>
                    <input
                      name="current"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={String(g.currentAmount)}
                      className="mt-1 w-36 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white dark:bg-slate-600"
                  >
                    Update
                  </button>
                </form>
              </div>
            );
          })
        )}
        {!loading && (data?.goals ?? []).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No goals yet. Create your first savings target above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
