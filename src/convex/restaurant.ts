import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("restaurantSettings").take(1);
    return settings[0] ?? null;
  },
});

export const updateSettings = mutation({
  args: {
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    email: v.optional(v.string()),
    openingHours: v.optional(v.string()),
    closingHours: v.optional(v.string()),
    isOpen: v.optional(v.boolean()),
    logo: v.optional(v.string()),
    gstPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const settings = await ctx.db.query("restaurantSettings").take(1);
    const filtered = Object.fromEntries(
      Object.entries(args).filter(([, v]) => v !== undefined),
    );

    if (settings.length > 0) {
      await ctx.db.patch(settings[0]._id, filtered);
    } else {
      await ctx.db.insert("restaurantSettings", {
        name: "Make Your Own Pizza",
        tagline: "Wood-fired artisan pizzas",
        isOpen: true,
        gstPercent: 5,
        ...filtered,
      });
    }
  },
});

export const toggleOpen = mutation({
  args: { isOpen: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const settings = await ctx.db.query("restaurantSettings").take(1);
    if (settings.length > 0) {
      await ctx.db.patch(settings[0]._id, { isOpen: args.isOpen });
    } else {
      await ctx.db.insert("restaurantSettings", {
        name: "Make Your Own Pizza",
        isOpen: args.isOpen,
        gstPercent: 5,
      });
    }
  },
});
