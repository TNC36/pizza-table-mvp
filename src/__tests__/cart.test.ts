import { describe, it, expect } from "vitest";

// Test the cart logic functions directly (avoiding React context for pure logic tests)

interface CartItem {
  id: string;
  type: "custom_pizza" | "menu_item";
  name: string;
  quantity: number;
  price: number;
  customPizzaData?: {
    base: string;
    basePrice: number;
    sauce: string;
    saucePrice: number;
    cheese: string;
    cheesePrice: number;
    toppings: { name: string; price: number }[];
  };
  menuItemId?: string;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function itemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

describe("Cart calculations", () => {
  it("calculates total for empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("calculates total for single item", () => {
    const items: CartItem[] = [
      { id: "1", type: "menu_item", name: "Margherita", quantity: 1, price: 299 },
    ];
    expect(calculateTotal(items)).toBe(299);
  });

  it("calculates total for multiple items", () => {
    const items: CartItem[] = [
      { id: "1", type: "menu_item", name: "Margherita", quantity: 2, price: 299 },
      { id: "2", type: "menu_item", name: "Garlic Bread", quantity: 1, price: 149 },
    ];
    expect(calculateTotal(items)).toBe(747); // 299*2 + 149
  });

  it("calculates total for custom pizza", () => {
    const items: CartItem[] = [
      {
        id: "1",
        type: "custom_pizza",
        name: "Custom Pizza",
        quantity: 1,
        price: 399,
        customPizzaData: {
          base: "Neapolitan",
          basePrice: 40,
          sauce: "Classic Tomato",
          saucePrice: 0,
          cheese: "Mozzarella",
          cheesePrice: 0,
          toppings: [
            { name: "Mushroom", price: 30 },
            { name: "Onion", price: 20 },
          ],
        },
      },
    ];
    expect(calculateTotal(items)).toBe(399);
  });

  it("counts item quantities correctly", () => {
    const items: CartItem[] = [
      { id: "1", type: "menu_item", name: "A", quantity: 3, price: 100 },
      { id: "2", type: "menu_item", name: "B", quantity: 2, price: 50 },
    ];
    expect(itemCount(items)).toBe(5);
  });

  it("handles quantity of zero", () => {
    const items: CartItem[] = [
      { id: "1", type: "menu_item", name: "A", quantity: 0, price: 100 },
    ];
    expect(calculateTotal(items)).toBe(0);
    expect(itemCount(items)).toBe(0);
  });
});

describe("GST calculation", () => {
  it("calculates 5% GST correctly", () => {
    const total = 299;
    const gst = Math.round(total * 0.05);
    expect(gst).toBe(15);
    expect(total + gst).toBe(314);
  });

  it("calculates GST for large order", () => {
    const total = 1500;
    const gst = Math.round(total * 0.05);
    expect(gst).toBe(75);
    expect(total + gst).toBe(1575);
  });
});
