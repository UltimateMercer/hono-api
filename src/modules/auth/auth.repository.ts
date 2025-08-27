import { eq, or } from "drizzle-orm";
import { db } from "../../config/database";
import { auth } from "../../db/schemas/auth.schema";
import { users } from "../../db/schemas/users.schema";
import type { CreateAuth } from "./auth.types";

export class AuthRepository {
  static async findByEmailOrUsername(identifier: string) {
    const [result] = await db
      .select()
      .from(auth)
      .leftJoin(users, eq(auth.id, users.auth_id))
      .where(or(eq(auth.email, identifier), eq(users.username, identifier)))
      .limit(1);

    return result || null;
  }

  static async create(data: CreateAuth) {
    return await db.transaction(async (tx) => {
      const [authRecord] = await tx
        .insert(auth)
        .values(data)
        .returning({ id: auth.id });

      const [userRecord] = await tx
        .insert(users)
        .values({ auth_id: authRecord.id, username: data.username })
        .returning();

      return {
        auth: authRecord,
        user: userRecord,
      };
    });
  }
}
