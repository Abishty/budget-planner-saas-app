import "dotenv/config";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import mercurius from "mercurius";
import { buildContext } from "./graphql/context.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { typeDefs } from "./graphql/schema.js";

const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example values into backend/.env`);
    process.exit(1);
  }
}

const app = Fastify({ logger: true });

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? true,
  credentials: true,
});

await app.register(mercurius, {
  schema: typeDefs,
  resolvers: resolvers as import("mercurius").IResolvers,
  graphiql: process.env.NODE_ENV !== "production",
  context: (request) => buildContext(request),
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  app.log.info(`GraphQL http://${host === "0.0.0.0" ? "localhost" : host}:${port}/graphql`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
