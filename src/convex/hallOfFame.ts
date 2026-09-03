import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const getPublishedWinners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("hallOfFame")
      .filter((q) => q.eq(q.field("published"), true))
      .collect();
  },
});

export const getAllWinners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("hallOfFame").collect();
  },
});

export const addWinner = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.string(),
    visitCount: v.number(),
    prizeTitle: v.string(),
    month: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("hallOfFame", args);
  },
});

export const updateWinner = mutation({
  args: {
    id: v.id("hallOfFame"),
    displayName: v.optional(v.string()),
    visitCount: v.optional(v.number()),
    prizeTitle: v.optional(v.string()),
    month: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteWinner = mutation({
  args: { id: v.id("hallOfFame") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
