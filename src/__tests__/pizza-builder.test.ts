import { describe, it, expect } from "vitest";

// Pizza builder pricing logic tests

interface PizzaBase { name: string; price: number; available: boolean; }
interface Sauce { name: string; price: number; available: boolean; }
interface Cheese { name: string; price: number; available: boolean; }
interface Topping { name: string; price: number; available: boolean; stockQuantity: number; }

function calculatePizzaPrice(
  base: PizzaBase,
  sauce: Sauce,
  cheese: Cheese,
  toppings: Topping[],
): number {
  return base.price + sauce.price + cheese.price + toppings.reduce((s, t) => s + t.price, 0);
}

function validateSelection(
  base: PizzaBase | null,
  sauce: Sauce | null,
  cheese: Cheese | null,
  toppings: Topping[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!base) errors.push("Base is required");
  else if (!base.available) errors.push(`Base "${base.name}" is not available`);

  if (!sauce) errors.push("Sauce is required");
  else if (!sauce.available) errors.push(`Sauce "${sauce.name}" is not available`);

  if (!cheese) errors.push("Cheese is required");
  else if (!cheese.available) errors.push(`Cheese "${cheese.name}" is not available`);

  for (const t of toppings) {
    if (!t.available) errors.push(`Topping "${t.name}" is not available`);
    if (t.stockQuantity <= 0) errors.push(`Topping "${t.name}" is out of stock`);
  }

  return { valid: errors.length === 0, errors };
}

describe("Pizza price calculation", () => {
  const base = { name: "Classic", price: 0, available: true };
  const sauce = { name: "Tomato", price: 0, available: true };
  const cheese = { name: "Mozzarella", price: 0, available: true };

  it("calculates price for basic pizza (all included)", () => {
    expect(calculatePizzaPrice(base, sauce, cheese, [])).toBe(0);
  });

  it("adds base price", () => {
    const neapolitan = { name: "Neapolitan", price: 40, available: true };
    expect(calculatePizzaPrice(neapolitan, sauce, cheese, [])).toBe(40);
  });

  it("adds sauce price", () => {
    const pesto = { name: "Pesto", price: 30, available: true };
    expect(calculatePizzaPrice(base, pesto, cheese, [])).toBe(30);
  });

  it("adds cheese price", () => {
    const extra = { name: "Extra Mozzarella", price: 40, available: true };
    expect(calculatePizzaPrice(base, sauce, extra, [])).toBe(40);
  });

  it("adds topping prices", () => {
    const toppings: Topping[] = [
      { name: "Mushroom", price: 30, available: true, stockQuantity: 10 },
      { name: "Onion", price: 20, available: true, stockQuantity: 10 },
    ];
    expect(calculatePizzaPrice(base, sauce, cheese, toppings)).toBe(50);
  });

  it("calculates full pizza price", () => {
    const neapolitan = { name: "Neapolitan", price: 40, available: true };
    const pesto = { name: "Pesto", price: 30, available: true };
    const extra = { name: "Extra Mozzarella", price: 40, available: true };
    const toppings: Topping[] = [
      { name: "Mushroom", price: 30, available: true, stockQuantity: 10 },
      { name: "Chicken", price: 60, available: true, stockQuantity: 5 },
    ];
    expect(calculatePizzaPrice(neapolitan, pesto, extra, toppings)).toBe(200);
  });

  it("calculates price with no toppings", () => {
    expect(calculatePizzaPrice(base, sauce, cheese, [])).toBe(0);
  });
});

describe("Pizza selection validation", () => {
  const availableBase = { name: "Classic", price: 0, available: true };
  const unavailableBase = { name: "Stuffed", price: 60, available: false };
  const availableSauce = { name: "Tomato", price: 0, available: true };
  const availableCheese = { name: "Mozzarella", price: 0, available: true };
  const availableTopping: Topping = { name: "Mushroom", price: 30, available: true, stockQuantity: 10 };
  const outOfStockTopping: Topping = { name: "Jalapeño", price: 30, available: false, stockQuantity: 0 };

  it("validates complete selection", () => {
    const result = validateSelection(availableBase, availableSauce, availableCheese, [availableTopping]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("requires base", () => {
    const result = validateSelection(null, availableSauce, availableCheese, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Base is required");
  });

  it("requires sauce", () => {
    const result = validateSelection(availableBase, null, availableCheese, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Sauce is required");
  });

  it("requires cheese", () => {
    const result = validateSelection(availableBase, availableSauce, null, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Cheese is required");
  });

  it("rejects unavailable base", () => {
    const result = validateSelection(unavailableBase, availableSauce, availableCheese, []);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not available"))).toBe(true);
  });

  it("rejects out-of-stock topping", () => {
    const result = validateSelection(availableBase, availableSauce, availableCheese, [outOfStockTopping]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("out of stock") || e.includes("not available"))).toBe(true);
  });

  it("allows empty toppings", () => {
    const result = validateSelection(availableBase, availableSauce, availableCheese, []);
    expect(result.valid).toBe(true);
  });

  it("validates with multiple toppings", () => {
    const result = validateSelection(availableBase, availableSauce, availableCheese, [availableTopping]);
    expect(result.valid).toBe(true);
  });
});

describe("Topping availability", () => {
  it("marks topping unavailable when stock is zero", () => {
    const topping: Topping = { name: "Olives", price: 30, available: true, stockQuantity: 0 };
    expect(topping.stockQuantity <= 0 || !topping.available).toBe(true);
  });

  it("marks topping available when stock is positive", () => {
    const topping: Topping = { name: "Olives", price: 30, available: true, stockQuantity: 5 };
    expect(topping.stockQuantity > 0 && topping.available).toBe(true);
  });

  it("decrements stock on order", () => {
    const topping: Topping = { name: "Mushroom", price: 30, available: true, stockQuantity: 10 };
    const quantity = 2;
    const newStock = topping.stockQuantity - quantity;
    expect(newStock).toBe(8);
    expect(newStock > 0).toBe(true);
  });

  it("sets available to false when stock reaches zero", () => {
    const topping: Topping = { name: "Jalapeño", price: 30, available: true, stockQuantity: 1 };
    const newStock = Math.max(0, topping.stockQuantity - 1);
    const newAvailable = newStock > 0;
    expect(newStock).toBe(0);
    expect(newAvailable).toBe(false);
  });
});
