import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function updateUser(
  userID: string,
  email: string,
  hashedPassword: string
) {
  try {
    const [row] = await db
      .update(users)
      .set({
        email: email,
        hashedPassword: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userID))
      .returning();

    return row;
  } catch (error) {
    console.log("what the");
    console.log(error);
  }
}

export async function deleteUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email));
  return row;
}

export async function getUserByID(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id));
  return row;
}
