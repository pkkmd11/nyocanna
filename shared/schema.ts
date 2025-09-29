import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: json("name").notNull(), // {en: string, my: string}
  description: json("description").notNull(), // {en: string, my: string}
  quality: text("quality").notNull(), // 'high' | 'medium' | 'low'
  images: json("images").$type<string[]>().notNull().default([]),
  videos: json("videos").$type<string[]>().notNull().default([]),
  specifications: json("specifications").$type<{en: string[], my: string[]}>().default({en: [], my: []}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: text("section").notNull(), // 'about', 'how-to-order', 'faq', etc.
  content: json("content").notNull(), // {en: any, my: any}
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactInfo = pgTable("contact_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull().unique(), // 'telegram', 'whatsapp', 'messenger'
  url: text("url").notNull(),
  qrCode: text("qr_code"), // base64 or URL to QR code image
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const faqItems = pgTable("faq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: json("question").notNull(), // {en: string, my: string}
  answer: json("answer").notNull(), // {en: string, my: string}
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({
  id: true,
  updatedAt: true,
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
  updatedAt: true,
});

export const insertFaqItemSchema = createInsertSchema(faqItems).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;

export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = z.infer<typeof insertFaqItemSchema>;
