import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already seeded
    const existingBases = await ctx.db.query("pizzaBases").take(1);
    if (existingBases.length > 0) return "Already seeded";

    // Seed pizza bases
    const bases = [
      { name: "Classic", description: "Traditional hand-tossed base", price: 0, available: true, sortOrder: 0 },
      { name: "Thin Crust", description: "Crispy thin crust", price: 20, available: true, sortOrder: 1 },
      { name: "Neapolitan", description: "Soft, puffy, wood-fired", price: 40, available: true, sortOrder: 2 },
      { name: "Stuffed Crust", description: "Cheese-filled crust edge", price: 60, available: true, sortOrder: 3 },
    ];
    for (const b of bases) await ctx.db.insert("pizzaBases", b);

    // Seed sauces
    const sauces = [
      { name: "Classic Tomato", description: "Rich tomato sauce", price: 0, available: true, sortOrder: 0 },
      { name: "Spicy Tomato", description: "With a kick of chili", price: 10, available: true, sortOrder: 1 },
      { name: "BBQ", description: "Smoky BBQ sauce", price: 20, available: true, sortOrder: 2 },
      { name: "Pesto", description: "Fresh basil pesto", price: 30, available: true, sortOrder: 3 },
      { name: "White Garlic", description: "Creamy garlic base", price: 20, available: true, sortOrder: 4 },
    ];
    for (const s of sauces) await ctx.db.insert("sauces", s);

    // Seed cheeses
    const cheeses = [
      { name: "Mozzarella", description: "Classic melted mozzarella", price: 0, available: true, sortOrder: 0 },
      { name: "Extra Mozzarella", description: "Double the cheese", price: 40, available: true, sortOrder: 1 },
      { name: "Cheddar", description: "Sharp cheddar blend", price: 30, available: true, sortOrder: 2 },
      { name: "Parmesan", description: "Aged parmesan", price: 50, available: true, sortOrder: 3 },
    ];
    for (const c of cheeses) await ctx.db.insert("cheeses", c);

    // Seed toppings
    const toppings = [
      { name: "Mushroom", description: "Fresh button mushrooms", price: 30, category: "veg", stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 0 },
      { name: "Onion", description: "Sliced red onion", price: 20, category: "veg", stockQuantity: 60, lowStockThreshold: 10, available: true, sortOrder: 1 },
      { name: "Capsicum", description: "Green bell pepper", price: 20, category: "veg", stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 2 },
      { name: "Jalapeño", description: "Spicy jalapeño slices", price: 30, category: "veg", stockQuantity: 30, lowStockThreshold: 5, available: true, sortOrder: 3 },
      { name: "Olives", description: "Black olive rings", price: 30, category: "veg", stockQuantity: 40, lowStockThreshold: 8, available: true, sortOrder: 4 },
      { name: "Corn", description: "Sweet corn kernels", price: 20, category: "veg", stockQuantity: 45, lowStockThreshold: 10, available: true, sortOrder: 5 },
      { name: "Paneer", description: "Cubed paneer", price: 40, category: "veg", stockQuantity: 35, lowStockThreshold: 8, available: true, sortOrder: 6 },
      { name: "Tomato", description: "Fresh tomato slices", price: 15, category: "veg", stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 7 },
      { name: "Chicken", description: "Grilled chicken pieces", price: 60, category: "non-veg", stockQuantity: 30, lowStockThreshold: 5, available: true, sortOrder: 8 },
      { name: "Pepperoni", description: "Spicy pepperoni slices", price: 70, category: "non-veg", stockQuantity: 25, lowStockThreshold: 5, available: true, sortOrder: 9 },
      { name: "Ham", description: "Smoked ham", price: 50, category: "non-veg", stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 10 },
      { name: "Bacon", description: "Crispy bacon bits", price: 60, category: "non-veg", stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 11 },
    ];
    for (const t of toppings) await ctx.db.insert("toppings", t);

    // Seed menu items
    const menuItems = [
      { name: "Margherita", description: "Classic tomato, mozzarella, basil", category: "Signature Pizzas", price: 299, available: true, ingredients: ["Classic Tomato", "Mozzarella"] },
      { name: "Pepperoni Supreme", description: "Loaded with pepperoni and cheese", category: "Signature Pizzas", price: 399, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Pepperoni"] },
      { name: "Farm Fresh", description: "Garden vegetables on wood-fired crust", category: "Signature Pizzas", price: 349, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Mushroom", "Onion", "Capsicum", "Corn"] },
      { name: "BBQ Chicken", description: "Smoky BBQ with grilled chicken", category: "Signature Pizzas", price: 429, available: true, ingredients: ["BBQ", "Mozzarella", "Chicken", "Onion", "Capsicum"] },
      { name: "Paneer Tikka", description: "Spicy paneer tikka pizza", category: "Signature Pizzas", price: 379, available: true, ingredients: ["Spicy Tomato", "Mozzarella", "Paneer", "Onion", "Capsicum"] },
      { name: "Classic Cheese", description: "Simple and cheesy", category: "Classic Pizzas", price: 249, available: true, ingredients: ["Classic Tomato", "Mozzarella"] },
      { name: "Veggie Delight", description: "All the veggies you love", category: "Classic Pizzas", price: 299, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Mushroom", "Onion", "Capsicum", "Corn"] },
      { name: "Chicken Fiesta", description: "Chicken with all the fixings", category: "Classic Pizzas", price: 379, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Chicken", "Mushroom", "Onion"] },
      { name: "Garlic Bread", description: "Toasted with garlic butter", category: "Sides", price: 149, available: true },
      { name: "Cheesy Fries", description: "Loaded with cheese sauce", category: "Sides", price: 179, available: true },
      { name: "Chicken Wings", description: "Spicy buffalo wings (6 pcs)", category: "Sides", price: 249, available: true },
      { name: "Tiramisu", description: "Classic Italian dessert", category: "Desserts", price: 199, available: true },
      { name: "Chocolate Lava Cake", description: "Warm molten chocolate center", category: "Desserts", price: 229, available: true },
      { name: "Coca-Cola", description: "330ml", category: "Beverages", price: 60, available: true },
      { name: "Fresh Lime Soda", description: "Freshly squeezed lime", category: "Beverages", price: 80, available: true },
      { name: "Mango Lassi", description: "Creamy mango yogurt drink", category: "Beverages", price: 120, available: true },
    ];
    for (const m of menuItems) await ctx.db.insert("menuItems", m);

    // Seed loyalty rules
    await ctx.db.insert("loyaltyRules", {
      perVisitPoints: 10,
      perRupeePoints: 0.1,
      customPizzaBonus: 5,
    });

    // Seed default tables
    for (let i = 1; i <= 20; i++) {
      await ctx.db.insert("tables", {
        tableNumber: i,
        qrIdentifier: `TABLE-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        active: true,
      });
    }

    return "Seeded successfully";
  },
});
