import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type Chat = typeof chat.$inferSelect;

export const chatRelations = relations(chat, ({ many }) => ({
  messages: many(message),
}));

export const messageRole = pgEnum("message_role", ["assistant", "user"]);

export const message = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  role: messageRole("role").notNull(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
}));
