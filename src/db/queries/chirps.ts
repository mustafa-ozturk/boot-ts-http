import { asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps(sort?: "asc" | "desc") {
  const rows = await db
    .select()
    .from(chirps)
    .orderBy(
      !sort || sort === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt)
    );
  return rows;
}

export async function getChirpById(id: string) {
  const [row] = await db.select().from(chirps).where(eq(chirps.id, id));
  return row;
}

export async function getChirpsByUserId(userId: string, sort?: "asc" | "desc") {
  const rows = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, userId))
    .orderBy(sort === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return rows;
}

export async function deleteChirpById(id: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return rows.length > 0;
}
