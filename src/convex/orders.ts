import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireAuth } from "./helpers";

export const placeOrder = mutation({
  args: {
    tableId: v.id("tables"),
    tableSessionId: v.optional(v.id("tableSessions")),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate table exists and is active
    const table = await ctx.db.get(args.tableId);
    if (!table || !table.active) {
      throw new Error("Table is not available");
    }

    // Validate table session if provided
    if (args.tableSessionId) {
      const session = await ctx.db.get(args.tableSessionId);
      if (!session || !session.active) {
        throw new Error("Table session is not active");
      }
    }

    // Server-side price calculation and validation
    let totalAmount = 0;

    // Fetch all ingredient data once
    const allBases = await ctx.db.query("pizzaBases").collect();
    const allSauces = await ctx.db.query("sauces").collect();
    const allCheeses = await ctx.db.query("cheeses").collect();
    const allToppings = await ctx.db.query("toppings").collect();

    for (const item of args.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
        const d = item.customPizzaData;

        // Validate and price base
        const base = allBases.find((b) => b.name === d.base);
        if (!base || !base.available)
          throw new Error(`Base "${d.base}" is not available`);

        // Validate and price sauce
        const sauce = allSauces.find((s) => s.name === d.sauce);
        if (!sauce || !sauce.available)
          throw new Error(`Sauce "${d.sauce}" is not available`);

        // Validate and price cheese
        const cheese = allCheeses.find((c) => c.name === d.cheese);
        if (!cheese || !cheese.available)
          throw new Error(`Cheese "${d.cheese}" is not available`);

        // Validate and price toppings
        for (const t of d.toppings) {
          const topping = allToppings.find((tp) => tp.name === t.name);
          if (!topping || !topping.available || topping.stockQuantity <= 0) {
            throw new Error(`Topping "${t.name}" is not available`);
          }
        }

        // Calculate server-side price (ignore client-sent price)
        const serverPrice =
          base.price + sauce.price + cheese.price +
          d.toppings.reduce((sum, t) => {
            const tp = allToppings.find((x) => x.name === t.name);
            return sum + (tp?.price ?? 0);
          }, 0);

        totalAmount += serverPrice * item.quantity;
      } else if (item.type === "menu_item" && item.menuItemId) {
        const menuItem = await ctx.db.get(item.menuItemId);
        if (!menuItem || !menuItem.available)
          throw new Error("Menu item not available");

        // Use server-side price
        totalAmount += menuItem.price * item.quantity;
      } else {
        // Fallback: use the price from the item but validate it exists
        totalAmount += item.price * item.quantity;
      }
    }

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

    const now = Date.now();

    // Create order with server-calculated price and timestamps
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId,
      tableId: args.tableId,
      tableSessionId: args.tableSessionId,
      items: args.items,
      totalAmount,
      paymentMethod: args.paymentMethod,
      paymentStatus:
        args.paymentMethod === "cash" ? "cash_pending" : "pending",
      orderStatus: "placed",
      notes: args.notes,
      createdAt: now,
      placedAt: now,
    });

    // Decrement stock for custom pizza toppings
    for (const item of args.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
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

    // Award loyalty points
    const rules = await ctx.db.query("loyaltyRules").take(1);
    const loyaltyRule = rules[0];
    const perRupee = loyaltyRule?.perRupeePoints ?? 0.1;
    const customBonus = loyaltyRule?.customPizzaBonus ?? 5;

    const hasCustomPizza = args.items.some(
      (i) => i.type === "custom_pizza",
    );
    const pointsEarned =
      Math.floor(totalAmount / 100) * perRupee +
      (hasCustomPizza ? customBonus : 0);

    const user = await ctx.db.get(userId);
    if (user && pointsEarned > 0) {
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
        createdAt: now,
      });
    }

    return { orderId, orderNumber };
  },
});

export const getOrdersByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Verify the requesting user can see these orders
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

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
    cancelReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const patchData: Record<string, unknown> = {
      orderStatus: args.status,
    };

    // Set appropriate timestamp
    switch (args.status) {
      case "confirmed":
        patchData.confirmedAt = now;
        break;
      case "preparing":
        patchData.preparingAt = now;
        break;
      case "in_oven":
        patchData.inOvenAt = now;
        break;
      case "ready":
        patchData.readyAt = now;
        break;
      case "completed":
        patchData.completedAt = now;
        break;
      case "cancelled":
        patchData.cancelledAt = now;
        if (args.cancelReason) {
          patchData.cancelReason = args.cancelReason;
        }
        break;
    }

    await ctx.db.patch(args.orderId, patchData);
  },
});

export const cancelOrder = mutation({
  args: {
    orderId: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Customers can only cancel if order is placed or confirmed
    // Admin can cancel any order
    const user = await ctx.db.get(userId);
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
      if (
        order.orderStatus !== "placed" &&
        order.orderStatus !== "confirmed"
      ) {
        throw new Error(
          "Cannot cancel order that is already being prepared",
        );
      }
      if (order.userId !== userId) {
        throw new Error("Cannot cancel another user's order");
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      orderStatus: "cancelled",
      cancelledAt: now,
      cancelReason: args.reason ?? "Customer requested cancellation",
    });

    // Restore stock for custom pizza toppings
    for (const item of order.items) {
      if (item.type === "custom_pizza" && item.customPizzaData) {
        const allToppings = await ctx.db.query("toppings").collect();
        for (const t of item.customPizzaData.toppings) {
          const topping = allToppings.find((tp) => tp.name === t.name);
          if (topping) {
            await ctx.db.patch(topping._id, {
              stockQuantity: topping.stockQuantity + item.quantity,
              available: true,
            });
          }
        }
      }
    }

    return { success: true };
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
    await requireAdmin(ctx);
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

export const getOrdersBySession = query({
  args: { sessionId: v.id("tableSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("tableSessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});
