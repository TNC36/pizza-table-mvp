import { query } from "./_generated/server";

export const getSalesStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekMs = weekStart.getTime();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthMs = monthStart.getTime();

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .collect();

    const completedOrders = allOrders.filter(
      (o) => o.orderStatus !== "cancelled",
    );

    const todayOrders = completedOrders.filter(
      (o) => o.createdAt >= todayMs,
    );
    const weekOrders = completedOrders.filter(
      (o) => o.createdAt >= weekMs,
    );
    const monthOrders = completedOrders.filter(
      (o) => o.createdAt >= monthMs,
    );

    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const weekSales = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSales = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    const pendingOrders = allOrders.filter(
      (o) =>
        o.orderStatus !== "completed" && o.orderStatus !== "cancelled",
    ).length;

    const completedOrdersToday = todayOrders.filter(
      (o) => o.orderStatus === "completed",
    ).length;

    const avgOrderValue =
      todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    // Customer count
    const users = await ctx.db.query("users").collect();
    const totalCustomers = users.length;

    return {
      todaySales,
      todayOrders: todayOrders.length,
      weekSales,
      weekOrders: weekOrders.length,
      monthSales,
      monthOrders: monthOrders.length,
      totalSales,
      totalOrders: completedOrders.length,
      pendingOrders,
      completedOrdersToday,
      avgOrderValue,
      totalCustomers,
    };
  },
});

export const getPeakHours = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .collect();

    const hourMap: Record<number, { orders: number; revenue: number }> = {};

    for (let h = 0; h < 24; h++) {
      hourMap[h] = { orders: 0, revenue: 0 };
    }

    for (const order of allOrders) {
      if (order.orderStatus === "cancelled") continue;
      const hour = new Date(order.createdAt).getHours();
      hourMap[hour].orders += 1;
      hourMap[hour].revenue += order.totalAmount;
    }

    const peakHour = Object.entries(hourMap).reduce(
      (max, [h, data]) =>
        data.orders > max.orders ? { hour: Number(h), ...data } : max,
      { hour: 0, orders: 0, revenue: 0 },
    );

    return { hours: hourMap, peakHour };
  },
});

export const getPopularItems = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .collect();

    const toppingCount: Record<string, number> = {};
    const baseCount: Record<string, number> = {};
    const sauceCount: Record<string, number> = {};
    const cheeseCount: Record<string, number> = {};
    const menuItemCount: Record<string, { count: number; revenue: number }> =
      {};

    for (const order of allOrders) {
      if (order.orderStatus === "cancelled") continue;
      for (const item of order.items) {
        if (item.type === "custom_pizza" && item.customPizzaData) {
          const d = item.customPizzaData;
          baseCount[d.base] = (baseCount[d.base] ?? 0) + item.quantity;
          sauceCount[d.sauce] = (sauceCount[d.sauce] ?? 0) + item.quantity;
          cheeseCount[d.cheese] =
            (cheeseCount[d.cheese] ?? 0) + item.quantity;
          for (const t of d.toppings) {
            toppingCount[t.name] =
              (toppingCount[t.name] ?? 0) + item.quantity;
          }
        }
        if (item.type === "menu_item") {
          const existing = menuItemCount[item.name] ?? {
            count: 0,
            revenue: 0,
          };
          menuItemCount[item.name] = {
            count: existing.count + item.quantity,
            revenue: existing.revenue + item.price * item.quantity,
          };
        }
      }
    }

    const sortByCount = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

    return {
      toppings: sortByCount(toppingCount),
      bases: sortByCount(baseCount),
      sauces: sortByCount(sauceCount),
      cheeses: sortByCount(cheeseCount),
      menuItems: Object.entries(menuItemCount)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([name, data]) => ({ name, ...data })),
    };
  },
});

export const getDailySales = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .collect();

    const dailyMap: Record<string, { sales: number; orders: number }> = {};

    for (const order of allOrders) {
      if (order.orderStatus === "cancelled") continue;
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      const existing = dailyMap[date] ?? { sales: 0, orders: 0 };
      dailyMap[date] = {
        sales: existing.sales + order.totalAmount,
        orders: existing.orders + 1,
      };
    }

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  },
});

export const getDayOfWeekStats = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .collect();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayMap: Record<string, { orders: number; revenue: number }> = {};

    for (const name of dayNames) {
      dayMap[name] = { orders: 0, revenue: 0 };
    }

    for (const order of allOrders) {
      if (order.orderStatus === "cancelled") continue;
      const day = dayNames[new Date(order.createdAt).getDay()];
      dayMap[day].orders += 1;
      dayMap[day].revenue += order.totalAmount;
    }

    return dayNames.map((name) => ({ name, ...dayMap[name] }));
  },
});

export const getPaymentStats = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .collect();

    const methodMap: Record<string, { count: number; revenue: number }> = {};

    for (const order of allOrders) {
      if (order.orderStatus === "cancelled") continue;
      const method = order.paymentMethod ?? "unknown";
      const existing = methodMap[method] ?? { count: 0, revenue: 0 };
      methodMap[method] = {
        count: existing.count + 1,
        revenue: existing.revenue + order.totalAmount,
      };
    }

    return Object.entries(methodMap).map(([method, data]) => ({
      method,
      ...data,
    }));
  },
});
