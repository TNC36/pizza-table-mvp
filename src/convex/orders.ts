import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";


export const placeOrder = mutation({
  args: {
    tableId: v.id("tables"),
    items: v.array(
      v.object({
        type: v.union(v.literal("custom_pizza"), v.literal("menu_item")),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
        customPizzaData: v.optional(
          v.object({
            base: v.string(),
            basePrice: v.number(),
            sauce: v.string(),
            saucePrice: v.number(),
            cheese: v.string(),
            cheesePrice: v.number(),
            toppings: v.array(
              v.object({ name: v.string(), price: v.number() }),
            ),
          }),
        ),
        menuItemId: v.optional(v.id("menuItems")),
      }),
    ),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate items server-side
    for (const item of args.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
        const d = item.customPizzaData;
        const bases = await ctx.db.query("pizzaBases").collect();
        const base = bases.find((b) => b.name === d.base);
        if (!base || !base.available) throw new Error(`Base "${d.base}" not available`);
        const sauces = await ctx.db.query("sauces").collect();
        const sauce = sauces.find((s) => s.name === d.sauce);
        if (!sauce || !sauce.available) throw new Error(`Sauce "${d.sauce}" not available`);
        const cheeses = await ctx.db.query("cheeses").collect();
        const cheese = cheeses.find((c) => c.name === d.cheese);
        if (!cheese || !cheese.available) throw new Error(`Cheese "${d.cheese}" not available`);
        const allToppings = await ctx.db.query("toppings").collect();
        for (const t of d.toppings) {
          const topping = allToppings.find((tp) => tp.name === t.name);
          if (!topping || !topping.available || topping.stockQuantity <= 0) {
            throw new Error(`Topping "${t.name}" not available`);
          }
        }
      }
      if (item.type === "menu_item" && item.menuItemId) {
        const menuItem = await ctx.db.get(item.menuItemId);
        if (!menuItem || !menuItem.available) throw new Error("Menu item not available");
      }
    }

    // Calculate total server-side
    let totalAmount = 0;
    for (const item of args.items) totalAmount += item.price * item.quantity;

    // Next order number
    const counter = await ctx.db.query("orderNumberCounter").take(1);
    let orderNumber: number;
    if (counter.length === 0) {
      await ctx.db.insert("orderNumberCounter", { currentNumber: 1001 });
      orderNumber = 1001;
    } else {
      orderNumber = counter[0].currentNumber + 1;
      await ctx.db.patch(counter[0]._id, { currentNumber: orderNumber });
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId,
      tableId: args.tableId,
      items: args.items,
      totalAmount,
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentMethod === "cash" ? "cash_pending" : "pending",
      orderStatus: "placed",
      createdAt: Date.now(),
    });

    // Decrement stock
    for (const item of args.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
        const allToppings = await ctx.db.query("toppings").collect();
        for (const t of item.customPizzaData.toppings) {
          const topping = allToppings.find((tp) => tp.name === t.name);
          if (topping && topping.stockQuantity > 0) {
            const newStock = topping.stockQuantity - item.quantity;
            await ctx.db.patch(topping._id, {
              stockQuantity: Math.max(0, newStock),
              available: newStock > 0,
            });
          }
        }
      }
    }

    // Loyalty points
    const pointsEarned = Math.floor(totalAmount / 10);
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        pointsBalance: (user.pointsBalance ?? 0) + pointsEarned,
        totalSpent: (user.totalSpent ?? 0) + totalAmount,
      });
      await ctx.db.insert("loyaltyTransactions", {
        userId,
        points: pointsEarned,
        type: "earned",
        orderId,
        description: `Earned ${pointsEarned} points for order #${orderNumber}`,
        createdAt: Date.now(),
      });
    }

    return { orderId, orderNumber };
  },
});

export const getOrdersByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(20);
  },
});

export const getOrdersByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").withIndex("by_table", (q) => q.eq("tableId", args.tableId)).order("desc").take(20);
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getActiveOrders = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").order("desc").collect();
    return all.filter((o) =>
      o.orderStatus === "placed" || o.orderStatus === "confirmed" ||
      o.orderStatus === "preparing" || o.orderStatus === "in_oven" || o.orderStatus === "ready",
    );
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").withIndex("by_created").order("desc").take(100);
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("placed"), v.literal("confirmed"), v.literal("preparing"),
      v.literal("in_oven"), v.literal("ready"), v.literal("completed"), v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { orderStatus: args.status });
  },
});

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"), v.literal("paid"), v.literal("failed"),
      v.literal("cash_pending"), v.literal("cash_collected"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { paymentStatus: args.status });
  },
});

export const getLatestOrderForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(1);
    return orders[0] ?? null;
  },
});
