import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // No auth required for seeding — allows first-time setup
    // Check if data already seeded
    const existingBases = await ctx.db.query("pizzaBases").take(1);
    if (existingBases.length > 0) return "Already seeded";

    // Seed pizza bases
    const bases = [
      { name: "Classic", description: "Traditional hand-tossed base", price: 0, available: true, sortOrder: 0 },
      { name: "Thin Crust", description: "Crispy thin crust", price: 20, available: true, sortOrder: 1 },
      { name: "Neapolitan", description: "Soft, puffy, wood-fired", price: 40, available: true, sortOrder: 2 },
      { name: "Stuffed Crust", description: "Cheese-filled crust edge", price: 60, available: true, sortOrder: 3 },
      { name: "Whole Wheat", description: "Healthy whole wheat base", price: 30, available: true, sortOrder: 4 },
    ];
    for (const b of bases) await ctx.db.insert("pizzaBases", b);

    // Seed sauces
    const sauces = [
      { name: "Classic Tomato", description: "Rich tomato sauce", price: 0, available: true, sortOrder: 0 },
      { name: "Spicy Tomato", description: "With a kick of chili", price: 10, available: true, sortOrder: 1 },
      { name: "BBQ", description: "Smoky BBQ sauce", price: 20, available: true, sortOrder: 2 },
      { name: "Pesto", description: "Fresh basil pesto", price: 30, available: true, sortOrder: 3 },
      { name: "White Garlic", description: "Creamy garlic base", price: 20, available: true, sortOrder: 4 },
      { name: "Buffalo", description: "Creamy buffalo sauce", price: 25, available: true, sortOrder: 5 },
    ];
    for (const s of sauces) await ctx.db.insert("sauces", s);

    // Seed cheeses
    const cheeses = [
      { name: "Mozzarella", description: "Classic melted mozzarella", price: 0, available: true, sortOrder: 0 },
      { name: "Extra Mozzarella", description: "Double the cheese", price: 40, available: true, sortOrder: 1 },
      { name: "Cheddar", description: "Sharp cheddar blend", price: 30, available: true, sortOrder: 2 },
      { name: "Parmesan", description: "Aged parmesan", price: 50, available: true, sortOrder: 3 },
      { name: "Four Cheese Blend", description: "Mozzarella, provolone, fontina, gouda", price: 60, available: true, sortOrder: 4 },
    ];
    for (const c of cheeses) await ctx.db.insert("cheeses", c);

    // Seed toppings
    const toppings = [
      { name: "Mushroom", description: "Fresh button mushrooms", price: 30, category: "veg", allergens: [] as string[], stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 0 },
      { name: "Onion", description: "Sliced red onion", price: 20, category: "veg", allergens: [] as string[], stockQuantity: 60, lowStockThreshold: 10, available: true, sortOrder: 1 },
      { name: "Capsicum", description: "Green bell pepper", price: 20, category: "veg", allergens: [] as string[], stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 2 },
      { name: "Jalapeño", description: "Spicy jalapeño slices", price: 30, category: "veg", allergens: [] as string[], stockQuantity: 30, lowStockThreshold: 5, available: true, sortOrder: 3 },
      { name: "Olives", description: "Black olive rings", price: 30, category: "veg", allergens: [] as string[], stockQuantity: 40, lowStockThreshold: 8, available: true, sortOrder: 4 },
      { name: "Corn", description: "Sweet corn kernels", price: 20, category: "veg", allergens: [] as string[], stockQuantity: 45, lowStockThreshold: 10, available: true, sortOrder: 5 },
      { name: "Paneer", description: "Cubed paneer", price: 40, category: "veg", allergens: ["dairy"] as string[], stockQuantity: 35, lowStockThreshold: 8, available: true, sortOrder: 6 },
      { name: "Tomato", description: "Fresh tomato slices", price: 15, category: "veg", allergens: [] as string[], stockQuantity: 50, lowStockThreshold: 10, available: true, sortOrder: 7 },
      { name: "Baby Corn", description: "Tender baby corn", price: 25, category: "veg", allergens: [] as string[], stockQuantity: 30, lowStockThreshold: 8, available: true, sortOrder: 8 },
      { name: "Sun-dried Tomato", description: "Concentrated sun-dried tomatoes", price: 40, category: "veg", allergens: [] as string[], stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 9 },
      { name: "Broccoli", description: "Fresh broccoli florets", price: 25, category: "veg", allergens: [] as string[], stockQuantity: 25, lowStockThreshold: 5, available: true, sortOrder: 10 },
      { name: "Chicken", description: "Grilled chicken pieces", price: 60, category: "non-veg", allergens: [] as string[], stockQuantity: 30, lowStockThreshold: 5, available: true, sortOrder: 11 },
      { name: "Pepperoni", description: "Spicy pepperoni slices", price: 70, category: "non-veg", allergens: ["gluten"] as string[], stockQuantity: 25, lowStockThreshold: 5, available: true, sortOrder: 12 },
      { name: "Ham", description: "Smoked ham", price: 50, category: "non-veg", allergens: [] as string[], stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 13 },
      { name: "Bacon", description: "Crispy bacon bits", price: 60, category: "non-veg", allergens: [] as string[], stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 14 },
      { name: "Tandoori Chicken", description: "Spiced tandoori chicken", price: 70, category: "non-veg", allergens: [] as string[], stockQuantity: 25, lowStockThreshold: 5, available: true, sortOrder: 15 },
      { name: "Sausage", description: "Italian spicy sausage", price: 55, category: "non-veg", allergens: ["gluten"] as string[], stockQuantity: 20, lowStockThreshold: 5, available: true, sortOrder: 16 },
    ];
    for (const t of toppings) await ctx.db.insert("toppings", t);

    // Seed menu items
    const menuItems = [
      { name: "Margherita", description: "Classic tomato, mozzarella, fresh basil", category: "Signature Pizzas", price: 299, available: true, ingredients: ["Classic Tomato", "Mozzarella"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Pepperoni Supreme", description: "Loaded with pepperoni and melted cheese", category: "Signature Pizzas", price: 399, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Pepperoni"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Farm Fresh", description: "Garden vegetables on wood-fired crust", category: "Signature Pizzas", price: 349, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Mushroom", "Onion", "Capsicum", "Corn"], allergens: ["dairy", "gluten"] as string[] },
      { name: "BBQ Chicken", description: "Smoky BBQ with grilled chicken", category: "Signature Pizzas", price: 429, available: true, ingredients: ["BBQ", "Mozzarella", "Chicken", "Onion", "Capsicum"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Paneer Tikka", description: "Spicy paneer tikka pizza", category: "Signature Pizzas", price: 379, available: true, ingredients: ["Spicy Tomato", "Mozzarella", "Paneer", "Onion", "Capsicum"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Meat Lovers", description: "Loaded with chicken, pepperoni, ham & bacon", category: "Signature Pizzas", price: 499, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Chicken", "Pepperoni", "Ham", "Bacon"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Classic Cheese", description: "Simple and cheesy", category: "Classic Pizzas", price: 249, available: true, ingredients: ["Classic Tomato", "Mozzarella"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Veggie Delight", description: "All the veggies you love", category: "Classic Pizzas", price: 299, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Mushroom", "Onion", "Capsicum", "Corn"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Chicken Fiesta", description: "Chicken with all the fixings", category: "Classic Pizzas", price: 379, available: true, ingredients: ["Classic Tomato", "Mozzarella", "Chicken", "Mushroom", "Onion"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Tandoori Veg", description: "Tandoori spiced vegetable pizza", category: "Classic Pizzas", price: 329, available: true, ingredients: ["Spicy Tomato", "Mozzarella", "Paneer", "Capsicum", "Onion", "Corn"], allergens: ["dairy", "gluten"] as string[] },
      { name: "Garlic Bread", description: "Toasted with garlic butter", category: "Sides", price: 149, available: true, allergens: ["dairy", "gluten"] as string[] },
      { name: "Cheesy Fries", description: "Loaded with cheese sauce", category: "Sides", price: 179, available: true, allergens: ["dairy"] as string[] },
      { name: "Chicken Wings", description: "Spicy buffalo wings (6 pcs)", category: "Sides", price: 249, available: true, allergens: [] as string[] },
      { name: "Bruschetta", description: "Toasted bread with tomato & basil", category: "Sides", price: 169, available: true, allergens: ["gluten"] as string[] },
      { name: "Tiramisu", description: "Classic Italian dessert", category: "Desserts", price: 199, available: true, allergens: ["dairy", "gluten"] as string[] },
      { name: "Chocolate Lava Cake", description: "Warm molten chocolate center", category: "Desserts", price: 229, available: true, allergens: ["dairy", "gluten"] as string[] },
      { name: "Panna Cotta", description: "Creamy vanilla with berry compote", category: "Desserts", price: 179, available: true, allergens: ["dairy"] as string[] },
      { name: "Coca-Cola", description: "330ml", category: "Beverages", price: 60, available: true },
      { name: "Fresh Lime Soda", description: "Freshly squeezed lime", category: "Beverages", price: 80, available: true },
      { name: "Mango Lassi", description: "Creamy mango yogurt drink", category: "Beverages", price: 120, available: true, allergens: ["dairy"] as string[] },
      { name: "Iced Tea", description: "Refreshing lemon iced tea", category: "Beverages", price: 90, available: true },
      { name: "Espresso", description: "Strong Italian espresso", category: "Beverages", price: 80, available: true },
    ];
    for (const m of menuItems) await ctx.db.insert("menuItems", m);

    // Seed loyalty rules
    await ctx.db.insert("loyaltyRules", {
      perVisitPoints: 10,
      perRupeePoints: 0.1,
      customPizzaBonus: 5,
    });

    // Seed loyalty rewards
    await ctx.db.insert("loyaltyRewards", {
      title: "Free Soft Drink",
      description: "Get a free soft drink with your next order",
      pointsRequired: 50,
      active: true,
    });
    await ctx.db.insert("loyaltyRewards", {
      title: "10% Off Next Pizza",
      description: "Get 10% off your next custom pizza",
      pointsRequired: 100,
      active: true,
    });
    await ctx.db.insert("loyaltyRewards", {
      title: "Free Garlic Bread",
      description: "Complimentary garlic bread",
      pointsRequired: 150,
      active: true,
    });
    await ctx.db.insert("loyaltyRewards", {
      title: "Free Custom Pizza",
      description: "Get a free Classic Custom Pizza",
      pointsRequired: 500,
      active: true,
    });

    // Seed default tables
    for (let i = 1; i <= 20; i++) {
      await ctx.db.insert("tables", {
        tableNumber: i,
        qrIdentifier: `TABLE-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        active: true,
      });
    }

    // Seed restaurant settings
    await ctx.db.insert("restaurantSettings", {
      name: "Make Your Own Pizza",
      tagline: "Wood-fired artisan pizzas made with love",
      phone: "+91 98765 43210",
      address: "123 Pizza Lane, Food Street",
      email: "hello@makeyourownpizza.com",
      openingHours: "11:00 AM",
      closingHours: "11:00 PM",
      isOpen: true,
      gstPercent: 5,
    });

    return "Seeded successfully";
  },
});
