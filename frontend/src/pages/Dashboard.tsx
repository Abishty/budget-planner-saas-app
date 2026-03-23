import { useQuery } from "@apollo/client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DASHBOARD_SUMMARY } from "../graphql/operations";
import { useAppSelector } from "../hooks";
import { formatMoney } from "../lib/format";
import type { CategorySpendRow } from "../types/api";

export function Dashboard() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? "USD");
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY);

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading…</p>;
  }
  if (error || !data) {
    return (
      <p className="text-red-600 dark:text-red-400">
        {error?.message ?? "Could not load dashboard"}
      </p>
    );
  }

  const { totalIncomeThisMonth, totalExpenseThisMonth, topCategories } =
    data.dashboardSummary;

  const chartData = topCategories.map((c: CategorySpendRow) => ({
    name: c.categoryName.length > 14 ? `${c.categoryName.slice(0, 12)}…` : c.categoryName,
    amount: c.amount,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          This month at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Income (month)
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-700 dark:text-brand-400">
            {formatMoney(totalIncomeThisMonth, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Expenses (month)
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatMoney(totalExpenseThisMonth, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)] sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Net (month)
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {formatMoney(
              totalIncomeThisMonth - totalExpenseThisMonth,
              currency
            )}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[var(--color-surface-muted)]">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Top spending categories
        </h2>
        {chartData.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Add expense transactions with categories to see this chart.
          </p>
        ) : (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-500"
                  tickFormatter={(v) => formatMoney(Number(v), currency)}
                />
                <Tooltip
                  formatter={(value: number) => [formatMoney(value, currency), "Spent"]}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--color-brand-500, #22c55e)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
