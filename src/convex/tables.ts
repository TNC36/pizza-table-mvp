import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuth } from "./helpers";

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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const incrementVisit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // This is called from the customer home page on first load
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

// === TABLE SESSIONS ===

export const getOrCreateTableSession = mutation({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    if (!user) throw new Error("User not found");

    const table = await ctx.db.get(args.tableId);
    if (!table || !table.active) {
      throw new Error("Table is not available");
    }

    // Check for existing active session on this table
    const existingSessions = await ctx.db
      .query("tableSessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("active"), true))
      .take(1);

    if (existingSessions.length > 0) {
      return existingSessions[0]._id;
    }

    // Create new session
    const sessionDate = new Date().toISOString().split("T")[0];
    const sessionCount = await ctx.db
      .query("tableSessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    const sessionId = await ctx.db.insert("tableSessions", {
      tableId: args.tableId,
      sessionNumber: `${sessionDate}-#${sessionCount.length + 1}`,
      startedAt: Date.now(),
      active: true,
      billRequested: false,
    });

    return sessionId;
  },
});

export const endTableSession = mutation({
  args: { sessionId: v.id("tableSessions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.sessionId, {
      active: false,
      endedAt: Date.now(),
    });
  },
});

export const requestBill = mutation({
  args: { sessionId: v.id("tableSessions") },
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);
    if (!user) throw new Error("User not found");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (!session.active) throw new Error("Session is no longer active");

    await ctx.db.patch(args.sessionId, {
      billRequested: true,
      billRequestedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getActiveSessionForTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tableSessions")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .filter((q) => q.eq(q.field("active"), true))
      .take(1);
    return sessions[0] ?? null;
  },
});

export const getTableSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tableSessions").order("desc").take(50);
  },
});
