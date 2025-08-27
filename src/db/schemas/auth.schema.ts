import { relations } from "drizzle-orm";
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { users } from "./users.schema";
import { timestamps } from "../helpers";

export const auth = table(
  "auth",
  {
    id: t.uuid().defaultRandom().primaryKey(), // UUID no lugar do serial
    email: t.text().notNull().unique(),
    username: t.text().notNull().unique(),
    password_hash: t.text(), // null para OAuth users
    password_salt: t.text(),

    // OAuth fields
    github_id: t.text(),
    google_id: t.text(),
    discord_id: t.text(),

    // Security & status
    email_verified: t.boolean().notNull().default(false),
    is_active: t.boolean().notNull().default(true),
    two_factor_enabled: t.boolean().notNull().default(false),
    two_factor_secret: t.text(),

    // Metadata
    last_login: t.timestamp(),
    password_changed_at: t.timestamp(),

    ...timestamps,
  },
  (table) => [
    // Índices únicos para OAuth
    t.uniqueIndex("auth_email_idx").on(auth.email),
    t.uniqueIndex("auth_username_idx").on(auth.username),
    t.uniqueIndex("auth_github_id_idx").on(table.github_id),
    t.uniqueIndex("auth_google_id_idx").on(table.google_id),
    t.uniqueIndex("auth_discord_id_idx").on(table.discord_id),
  ]
).enableRLS();

export const password_resets = table("password_resets", {
  id: t.uuid("id").defaultRandom().primaryKey(), // UUID
  auth_id: t
    .uuid("auth_id") // também UUID porque referencia auth.id
    .notNull()
    .references(() => auth.id, { onDelete: "cascade" }),
  token: t.text("token").notNull(),
  expires_at: t.timestamp("expires_at").notNull(),
  used: t.boolean("used").notNull().default(false),
  ...timestamps,
}).enableRLS();

export const authRelations = relations(auth, ({ one }) => ({
  user: one(users, {
    fields: [auth.id],
    references: [users.auth_id],
  }),
}));

export const passwordResetRelations = relations(password_resets, ({ one }) => ({
  auth: one(auth, {
    fields: [password_resets.auth_id],
    references: [auth.id],
  }),
}));
