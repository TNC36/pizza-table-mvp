import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      phone: v.optional(v.string()),
      pointsBalance: v.optional(v.number()),
      visitCount: v.optional(v.number()),
      totalSpent: v.optional(v.number()),
    }).index("email", ["email"])
      .index("by_phone", ["phone"]),

    pizzaBases: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      available: v.boolean(),
      sortOrder: v.optional(v.number()),
    }),

    sauces: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      available: v.boolean(),
      sortOrder: v.optional(v.number()),
    }),

    cheeses: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      available: v.boolean(),
      sortOrder: v.optional(v.number()),
    }),

    toppings: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      category: v.optional(v.string()),
      stockQuantity: v.number(),
      lowStockThreshold: v.number(),
      available: v.boolean(),
      sortOrder: v.optional(v.number()),
    }),

    menuItems: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      price: v.number(),
      image: v.optional(v.string()),
      available: v.boolean(),
      ingredients: v.optional(v.array(v.string())),
      sortOrder: v.optional(v.number()),
    }).index("by_category", ["category"]),

    tables: defineTable({
      tableNumber: v.number(),
      qrIdentifier: v.string(),
      active: v.boolean(),
    }).index("by_qr", ["qrIdentifier"]),

    orders: defineTable({
      orderNumber: v.number(),
      userId: v.id("users"),
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
      totalAmount: v.number(),
      paymentMethod: v.optional(v.string()),
      paymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("cash_pending"),
        v.literal("cash_collected"),
      ),
      orderStatus: v.union(
        v.literal("placed"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("in_oven"),
        v.literal("ready"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_table", ["tableId"])
      .index("by_status", ["orderStatus"])
      .index("by_created", ["createdAt"]),

    loyaltyRewards: defineTable({
      title: v.string(),
      description: v.string(),
      pointsRequired: v.number(),
      active: v.boolean(),
    }),

    loyaltyTransactions: defineTable({
      userId: v.id("users"),
      points: v.number(),
      type: v.union(v.literal("earned"), v.literal("redeemed")),
      orderId: v.optional(v.id("orders")),
      description: v.string(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    hallOfFame: defineTable({
      userId: v.id("users"),
      displayName: v.string(),
      visitCount: v.number(),
      prizeTitle: v.string(),
      month: v.string(),
      published: v.boolean(),
    }),

    orderNumberCounter: defineTable({
      currentNumber: v.number(),
    }),

    loyaltyRules: defineTable({
      perVisitPoints: v.number(),
      perRupeePoints: v.number(),
      customPizzaBonus: v.number(),
    }),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
