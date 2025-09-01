import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema";

export async function doesUserExist(email: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return existingUser;
}
