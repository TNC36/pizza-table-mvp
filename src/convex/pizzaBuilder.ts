import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// === BASES ===
export const getBases = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pizzaBases")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
  },
});

export const getAllBases = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pizzaBases").collect();
  },
});

export const createBase = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    available: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pizzaBases", {
      ...args,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const updateBase = mutation({
  args: {
    id: v.id("pizzaBases"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    available: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteBase = mutation({
  args: { id: v.id("pizzaBases") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// === SAUCES ===
export const getSauces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sauces")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
  },
});

export const getAllSauces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sauces").collect();
  },
});

export const createSauce = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    available: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sauces", {
      ...args,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const updateSauce = mutation({
  args: {
    id: v.id("sauces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteSauce = mutation({
  args: { id: v.id("sauces") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// === CHEESES ===
export const getCheeses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cheeses")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
  },
});

export const getAllCheeses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cheeses").collect();
  },
});

export const createCheese = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    available: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cheeses", {
      ...args,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const updateCheese = mutation({
  args: {
    id: v.id("cheeses"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteCheese = mutation({
  args: { id: v.id("cheeses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// === TOPPINGS ===
export const getToppings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("toppings")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
  },
});

export const getAllToppings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("toppings").collect();
  },
});

export const createTopping = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    stockQuantity: v.number(),
    lowStockThreshold: v.number(),
    available: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("toppings", {
      ...args,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const updateTopping = mutation({
  args: {
    id: v.id("toppings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    // Auto-update availability based on stock
    if (filtered.stockQuantity !== undefined) {
      filtered.available = (filtered.stockQuantity as number) > 0;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const deleteTopping = mutation({
  args: { id: v.id("toppings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
