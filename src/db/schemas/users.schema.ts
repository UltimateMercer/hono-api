import { relations } from "drizzle-orm";
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

import { auth } from "./auth.schema";
import { timestamps } from "../helpers";

export type SocialLinks = {
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  custom: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
};

// Default value para reutilizar
export const defaultSocialLinks: SocialLinks = {
  website: null,
  github: null,
  linkedin: null,
  twitter: null,
  instagram: null,
  youtube: null,
  custom: [],
};

// Tabela de usuário - dados de perfil e informações públicas
export const users = table(
  "users",
  {
    id: t.uuid("id").defaultRandom().primaryKey(), // UUID
    auth_id: t
      .uuid("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),
    username: t.text().notNull().unique(),

    // Profile info
    first_name: t.text("first_name"),
    last_name: t.text("last_name"),
    bio: t.text("bio"),

    // Avatar & media
    avatar_url: t.text("avatar_url"),
    cover_url: t.text("cover_url"),

    // Contact & social
    social_links: t.jsonb().default(JSON.stringify(defaultSocialLinks)),
    invitation_code: t.text().unique(),

    location: t.text("location"),
    timezone: t.text("timezone").default("UTC"),

    // Preferences
    language: t.text("language").default("en"),
    theme: t.text("theme").default("light"), // light, dark, auto

    // Privacy
    profile_visibility: t.text("profile_visibility").default("public"), // public, private, friends

    // Metadata
    ...timestamps,
  },
  (users) => [t.uniqueIndex("users_username_idx").on(users.username)]
).enableRLS();

export const userRelations = relations(users, ({ one }) => ({
  auth: one(auth, {
    fields: [users.auth_id],
    references: [auth.id],
  }),
}));
