import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true }),
  deleted_at: timestamp({ withTimezone: true }),
};
