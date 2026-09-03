import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get the next order number
async function getNextOrderNumber(ctx: any) {
  const counter = await ctx.db
    .query("orderNumberCounter")
    .take(1);
  if (counter.length === 0) {
    await ctx.db.insert("orderNumberCounter", { currentNumber: 1001 });
    return 1001;
  }
  const current = counter[0];
  const nextNum = current.currentNumber + 1;
  await ctx.db.patch(current._id, { currentNumber: nextNum });
  return nextNum;
}

// Validate order on server side
async function validateOrderItems(ctx: any, items: any[]) {
  for (const item of items) {
    if (item.type === "custom_pizza" && item.customPizzaData) {
      const data = item.customPizzaData;
      // Validate base exists and is available
      const bases = await ctx.db.query("pizzaBases").collect();
      const base = bases.find((b: any) => b.name === data.base);
      if (!base || !base.available) {
        throw new Error(`Base "${data.base}" is not available`);
      }
      // Validate sauce
      const sauces = await ctx.db.query("sauces").collect();
      const sauce = sauces.find((s: any) => s.name === data.sauce);
      if (!sauce || !sauce.available) {
        throw new Error(`Sauce "${data.sauce}" is not available`);
      }
      // Validate cheese
      const cheeses = await ctx.db.query("cheeses").collect();
      const cheese = cheeses.find((c: any) => c.name === data.cheese);
      if (!cheese || !cheese.available) {
        throw new Error(`Cheese "${data.cheese}" is not available`);
      }
      // Validate toppings
      const toppings = await ctx.db.query("toppings").collect();
      for (const t of data.toppings) {
        const topping = toppings.find((tp: any) => tp.name === t.name);
        if (!topping || !topping.available || topping.stockQuantity <= 0) {
          throw new Error(`Topping "${t.name}" is not available`);
        }
      }
    }
    if (item.type === "menu_item" && item.menuItemId) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem || !menuItem.available) {
        throw new Error(`Menu item is not available`);
      }
    }
  }
}

// Recalculate order total server-side
function calculateTotal(items: any[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

export const placeOrder = mutation({
  args: {
    tableId: v.id("tables"),
    items: v.array(v.object({
      type: v.union(v.literal("custom_pizza"), v.literal("menu_item")),
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
      customPizzaData: v.optional(v.object({
        base: v.string(),
        basePrice: v.number(),
        sauce: v.string(),
        saucePrice: v.number(),
        cheese: v.string(),
        cheesePrice: v.number(),
        toppings: v.array(v.object({
          name: v.string(),
          price: v.number(),
        })),
      })),
      menuItemId: v.optional(v.id("menuItems")),
    })),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate all items server-side
    await validateOrderItems(ctx, args.items);

    // Calculate total server-side
    const totalAmount = calculateTotal(args.items);

    // Get next order number
    const orderNumber = await getNextOrderNumber(ctx);

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

    // Decrement stock for custom pizza toppings
    for (const item of args.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
        for (const t of item.customPizzaData.toppings) {
          const toppings = await ctx.db.query("toppings").collect();
          const topping = toppings.find((tp: any) => tp.name === t.name);
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

    // Add loyalty points
    const pointsEarned = Math.floor(totalAmount / 10); // 1 point per ₹10
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
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const getOrdersByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .take(20);
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
    return all.filter(
      (o) =>
        o.orderStatus === "placed" ||
        o.orderStatus === "confirmed" ||
        o.orderStatus === "preparing" ||
        o.orderStatus === "in_oven" ||
        o.orderStatus === "ready",
    );
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .take(100);
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("placed"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("in_oven"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled"),
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
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("cash_pending"),
      v.literal("cash_collected"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { paymentStatus: args.status });
  },
});

export const getLatestOrderForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);
    return orders[0] ?? null;
  },
});
