import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "object" && payload !== null && "sub" in payload) {
      return { sub: String((payload as { sub: string }).sub) };
    }
  } catch {
    return null;
  }
  return null;
}
