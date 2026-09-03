import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTables = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tables").collect();
  },
});

export const getActiveTables = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tables")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const getTableByQR = query({
  args: { qrIdentifier: v.string() },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_qr", (q) => q.eq("qrIdentifier", args.qrIdentifier))
      .collect();
    return tables[0] ?? null;
  },
});

export const getTable = query({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createTable = mutation({
  args: {
    tableNumber: v.number(),
    qrIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tables", {
      tableNumber: args.tableNumber,
      qrIdentifier: args.qrIdentifier,
      active: true,
    });
  },
});

export const updateTable = mutation({
  args: {
    id: v.id("tables"),
    tableNumber: v.optional(v.number()),
    active: v.optional(v.boolean()),
    qrIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const deleteTable = mutation({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const incrementVisit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    await ctx.db.patch(args.userId, {
      visitCount: (user.visitCount ?? 0) + 1,
    });
  },
});

export const getActiveOrderForTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) =>
        q.not(
          q.or(
            q.eq(q.field("orderStatus"), "completed"),
            q.eq(q.field("orderStatus"), "cancelled"),
          ),
        ),
      )
      .order("desc")
      .take(1);
    return orders[0] ?? null;
  },
});
