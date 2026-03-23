import type { BudgetPeriod, Prisma, TransactionType } from "@prisma/client";
import type { MercuriusContext } from "mercurius";
import { hashPassword, signToken, verifyPassword } from "../../lib/auth.js";
import { requireUserId, type GraphQLContext } from "../context.js";

function toFloat(n: { toString(): string } | number): number {
  return typeof n === "number" ? n : Number(n.toString());
}

function monthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

type Ctx = MercuriusContext & GraphQLContext;

export const resolvers = {
  Query: {
    async me(_: unknown, __: unknown, ctx: Ctx) {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    },

    async categories(_: unknown, __: unknown, ctx: Ctx) {
      const userId = requireUserId(ctx);
      return ctx.prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
    },

    async transactions(_: unknown, args: { limit?: number | null }, ctx: Ctx) {
      const userId = requireUserId(ctx);
      const take = Math.min(args.limit ?? 100, 500);
      return ctx.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take,
        include: { category: true },
      });
    },

    async budgets(_: unknown, __: unknown, ctx: Ctx) {
      const userId = requireUserId(ctx);
      return ctx.prisma.budget.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { startDate: "desc" },
      });
    },

    async goals(_: unknown, __: unknown, ctx: Ctx) {
      const userId = requireUserId(ctx);
      return ctx.prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },

    async dashboardSummary(_: unknown, __: unknown, ctx: Ctx) {
      const userId = requireUserId(ctx);
      const { start, end } = monthRange();

      const agg = await ctx.prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId,
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      let totalIncomeThisMonth = 0;
      let totalExpenseThisMonth = 0;
      for (const row of agg) {
        const sum = row._sum.amount ? toFloat(row._sum.amount) : 0;
        if (row.type === "INCOME") totalIncomeThisMonth = sum;
        else totalExpenseThisMonth = sum;
      }

      const byCategory = await ctx.prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: start, lte: end },
          categoryId: { not: null },
        },
        _sum: { amount: true },
      });

      const categoryIds = byCategory
        .map((r) => r.categoryId)
        .filter((id): id is string => id !== null);

      const categories = await ctx.prisma.category.findMany({
        where: { id: { in: categoryIds }, userId },
      });
      const nameById = new Map(categories.map((c) => [c.id, c.name]));

      const topCategories = byCategory
        .map((r) => ({
          categoryId: r.categoryId!,
          categoryName: nameById.get(r.categoryId!) ?? "Unknown",
          amount: r._sum.amount ? toFloat(r._sum.amount) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return {
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        topCategories,
      };
    },
  },

  Mutation: {
    async register(
      _: unknown,
      args: { email: string; password: string; name?: string | null },
      ctx: Ctx
    ) {
      const email = args.email.trim().toLowerCase();
      if (args.password.length < 8) throw new Error("Password must be at least 8 characters");
      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("Email already registered");
      const passwordHash = await hashPassword(args.password);
      const user = await ctx.prisma.user.create({
        data: {
          email,
          passwordHash,
          name: args.name?.trim() || null,
        },
      });
      const token = signToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          darkMode: user.darkMode,
        },
      };
    },

    async login(
      _: unknown,
      args: { email: string; password: string },
      ctx: Ctx
    ) {
      const email = args.email.trim().toLowerCase();
      const user = await ctx.prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid email or password");
      const ok = await verifyPassword(args.password, user.passwordHash);
      if (!ok) throw new Error("Invalid email or password");
      const token = signToken(user.id);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          darkMode: user.darkMode,
        },
      };
    },

    async updateProfile(
      _: unknown,
      args: { name?: string | null; currency?: string | null; darkMode?: boolean | null },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      const data: Prisma.UserUpdateInput = {};
      if (args.name !== undefined && args.name !== null) data.name = args.name.trim() || null;
      if (args.currency !== undefined && args.currency !== null) data.currency = args.currency;
      if (args.darkMode !== undefined && args.darkMode !== null) data.darkMode = args.darkMode;
      return ctx.prisma.user.update({ where: { id: userId }, data });
    },

    async createTransaction(
      _: unknown,
      args: {
        input: {
          amount: number;
          description?: string | null;
          date: string;
          type: TransactionType;
          categoryId?: string | null;
        };
      },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      const { input } = args;
      if (input.categoryId) {
        const cat = await ctx.prisma.category.findFirst({
          where: { id: input.categoryId, userId },
        });
        if (!cat) throw new Error("Category not found");
        if (cat.type !== input.type) {
          throw new Error("Category type must match transaction type");
        }
      }
      return ctx.prisma.transaction.create({
        data: {
          userId,
          amount: input.amount,
          description: input.description?.trim() || null,
          date: new Date(input.date),
          type: input.type,
          categoryId: input.categoryId || null,
        },
        include: { category: true },
      });
    },

    async deleteTransaction(_: unknown, args: { id: string }, ctx: Ctx) {
      const userId = requireUserId(ctx);
      const t = await ctx.prisma.transaction.findFirst({
        where: { id: args.id, userId },
      });
      if (!t) throw new Error("Transaction not found");
      await ctx.prisma.transaction.delete({ where: { id: args.id } });
      return true;
    },

    async createCategory(
      _: unknown,
      args: { name: string; type: TransactionType; color?: string | null },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      return ctx.prisma.category.create({
        data: {
          userId,
          name: args.name.trim(),
          type: args.type,
          color: args.color?.trim() || null,
        },
      });
    },

    async createBudget(
      _: unknown,
      args: {
        categoryId: string;
        amount: number;
        period?: BudgetPeriod | null;
        startDate?: string | null;
      },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      const cat = await ctx.prisma.category.findFirst({
        where: { id: args.categoryId, userId },
      });
      if (!cat) throw new Error("Category not found");
      return ctx.prisma.budget.create({
        data: {
          userId,
          categoryId: args.categoryId,
          amount: args.amount,
          period: args.period ?? "MONTHLY",
          startDate: args.startDate ? new Date(args.startDate) : new Date(),
        },
        include: { category: true },
      });
    },

    async createGoal(
      _: unknown,
      args: { name: string; targetAmount: number; deadline?: string | null },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      return ctx.prisma.goal.create({
        data: {
          userId,
          name: args.name.trim(),
          targetAmount: args.targetAmount,
          currentAmount: 0,
          deadline: args.deadline ? new Date(args.deadline) : null,
        },
      });
    },

    async updateGoalCurrent(
      _: unknown,
      args: { id: string; currentAmount: number },
      ctx: Ctx
    ) {
      const userId = requireUserId(ctx);
      const goal = await ctx.prisma.goal.findFirst({
        where: { id: args.id, userId },
      });
      if (!goal) throw new Error("Goal not found");
      return ctx.prisma.goal.update({
        where: { id: args.id },
        data: { currentAmount: args.currentAmount },
      });
    },
  },

  User: {
    darkMode(parent: { darkMode?: boolean }) {
      return Boolean(parent.darkMode);
    },
  },

  Transaction: {
    amount(parent: { amount: unknown }) {
      return toFloat(parent.amount as { toString(): string });
    },
    date(parent: { date: Date }) {
      return parent.date.toISOString();
    },
  },

  Budget: {
    amount(parent: { amount: unknown }) {
      return toFloat(parent.amount as { toString(): string });
    },
    startDate(parent: { startDate: Date }) {
      return parent.startDate.toISOString();
    },
  },

  Goal: {
    targetAmount(parent: { targetAmount: unknown }) {
      return toFloat(parent.targetAmount as { toString(): string });
    },
    currentAmount(parent: { currentAmount: unknown }) {
      return toFloat(parent.currentAmount as { toString(): string });
    },
    deadline(parent: { deadline: Date | null }) {
      return parent.deadline ? parent.deadline.toISOString() : null;
    },
  },
};
