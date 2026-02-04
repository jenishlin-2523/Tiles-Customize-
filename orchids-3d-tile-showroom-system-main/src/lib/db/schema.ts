// Database Schema for Tile Visualization System
// Using Drizzle ORM with SQLite (libsql)

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Tiles table - stores tile metadata
export const tiles = sqliteTable("tiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["floor", "wall"] }).notNull(),
  width: integer("width").notNull(), // in mm (e.g., 300 for 30cm)
  height: integer("height").notNull(), // in mm
  finish: text("finish", { enum: ["glossy", "matte", "textured"] }).notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  collection: text("collection"), // e.g., "Marble", "Wood", "Concrete"
  color: text("color"), // primary color
  isPreloaded: integer("is_preloaded", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Room Designs table - stores saved room configurations
export const roomDesigns = sqliteTable("room_designs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  customerName: text("customer_name"),
  roomType: text("room_type", { enum: ["kitchen", "bathroom", "living_room"] }).notNull(),
  meshMappings: text("mesh_mappings").notNull(), // JSON: { meshId: { tileId, pattern, rotation } }
  lightingPreset: text("lighting_preset", { enum: ["daylight", "warm", "cool"] }).default("daylight"),
  screenshotUrl: text("screenshot_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Types derived from schema
export type Tile = typeof tiles.$inferSelect;
export type NewTile = typeof tiles.$inferInsert;
export type RoomDesign = typeof roomDesigns.$inferSelect;
export type NewRoomDesign = typeof roomDesigns.$inferInsert;

// Additional TypeScript types for the application
export type TileCategory = "floor" | "wall";
export type TileFinish = "glossy" | "matte" | "textured";
export type RoomType = "kitchen" | "bathroom" | "living_room";
export type LightingPreset = "daylight" | "warm" | "cool";
export type LayoutPattern = "straight" | "brick" | "herringbone" | "diagonal";

export interface MeshMapping {
  tileId: string;
  pattern: LayoutPattern;
  rotation: number; // degrees
  scale: number; // multiplier
}

export interface MeshMappings {
  [meshId: string]: MeshMapping;
}
