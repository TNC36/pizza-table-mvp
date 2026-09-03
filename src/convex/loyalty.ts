import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin } from "./helpers";

export const getLoyaltyRules = query({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.db.query("loyaltyRules").take(1);
    return rules[0] ?? null;
  },
});

export const updateLoyaltyRules = mutation({
  args: {
    perVisitPoints: v.number(),
    perRupeePoints: v.number(),
    customPizzaBonus: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rules = await ctx.db.query("loyaltyRules").take(1);
    if (rules.length > 0) {
      await ctx.db.patch(rules[0]._id, args);
    } else {
      await ctx.db.insert("loyaltyRules", args);
    }
  },
});

export const getRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("loyaltyRewards")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const getAllRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("loyaltyRewards").collect();
  },
});

export const createReward = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    pointsRequired: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("loyaltyRewards", args);
  },
});

export const updateReward = mutation({
  args: {
    id: v.id("loyaltyRewards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    pointsRequired: v.optional(v.number()),
    active: v.optional(v.boolean()),
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

export const deleteReward = mutation({
  args: { id: v.id("loyaltyRewards") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const getUserPoints = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      pointsBalance: user.pointsBalance ?? 0,
      visitCount: user.visitCount ?? 0,
      totalSpent: user.totalSpent ?? 0,
    };
  },
});

export const getUserTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const redeemReward = mutation({
  args: { rewardId: v.id("loyaltyRewards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reward = await ctx.db.get(args.rewardId);
    if (!reward || !reward.active) throw new Error("Reward not available");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentPoints = user.pointsBalance ?? 0;
    if (currentPoints < reward.pointsRequired) {
      throw new Error("Insufficient points");
    }

    await ctx.db.patch(userId, {
      pointsBalance: currentPoints - reward.pointsRequired,
    });

    await ctx.db.insert("loyaltyTransactions", {
      userId,
      points: reward.pointsRequired,
      type: "redeemed",
      description: `Redeemed: ${reward.title}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
