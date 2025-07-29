import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(
  user: NewUser
): Promise<Omit<NewUser, "hashed_password"> | undefined> {
  try {
    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoNothing()
      .returning();
    return result;
  } catch (error) {
    console.log("DB error:", error);
    return undefined;
  }
}

export async function deleteUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email));
  return row;
}
