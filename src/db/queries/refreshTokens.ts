import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export const createRefreshToken = async (refreshToken: NewRefreshToken) => {
  const [row] = await db.insert(refreshTokens).values(refreshToken).returning();
  return row;
};

export const getRefreshToken = async (token: string) => {
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return row;
};

export const revokeRefreshToken = async (token: string) => {
  const now = new Date();
  await db
    .update(refreshTokens)
    .set({
      revokedAt: now,
      updatedAt: now,
    })
    .where(eq(refreshTokens.token, token));
};
