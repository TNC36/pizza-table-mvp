import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const promoteUser = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireAdmin(ctx);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    const oldRole = targetUser.role ?? "user";
    await ctx.db.patch(args.userId, { role: args.role });

    // Audit log
    await ctx.db.insert("adminAuditLogs", {
      adminUserId,
      action: "role_changed",
      entityType: "user",
      entityId: args.userId,
      details: `Changed role from "${oldRole}" to "${args.role}"`,
      oldValues: oldRole,
      newValues: args.role,
      createdAt: Date.now(),
    });
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

// Admin audit logs
export const getAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("adminAuditLogs")
      .withIndex("by_created")
      .order("desc")
      .take(100);
  },
});

export const recordAuditLog = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
    oldValues: v.optional(v.string()),
    newValues: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    await ctx.db.insert("adminAuditLogs", {
      adminUserId: userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.details,
      oldValues: args.oldValues,
      newValues: args.newValues,
      createdAt: Date.now(),
    });
  },
});
