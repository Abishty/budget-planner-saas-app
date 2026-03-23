import type { FastifyRequest } from "fastify";
import { prisma } from "../db/prisma.js";
import { verifyToken } from "../lib/auth.js";

export type GraphQLContext = {
  prisma: typeof prisma;
  userId: string | null;
};

export async function buildContext(req: FastifyRequest): Promise<GraphQLContext> {
  const auth = req.headers.authorization;
  let userId: string | null = null;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    if (payload?.sub) userId = payload.sub;
  }
  return { prisma, userId };
}

export function requireUserId(ctx: GraphQLContext): string {
  if (!ctx.userId) throw new Error("Unauthorized");
  return ctx.userId;
}
