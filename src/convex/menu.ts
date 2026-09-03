import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMenuItems = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("menuItems")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("available"), true))
        .collect();
    }
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
  },
});

export const getAllMenuItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

export const createMenuItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    price: v.number(),
    image: v.optional(v.string()),
    available: v.boolean(),
    ingredients: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      sortOrder: args.sortOrder ?? 0,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    available: v.optional(v.boolean()),
    ingredients: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
