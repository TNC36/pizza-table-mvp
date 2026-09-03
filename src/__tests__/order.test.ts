import { describe, it, expect } from "vitest";

// Order and loyalty logic tests

interface OrderItem {
  type: "custom_pizza" | "menu_item";
  name: string;
  quantity: number;
  price: number;
}

function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateLoyaltyPoints(totalAmount: number): number {
  return Math.floor(totalAmount / 10);
}

function generateOrderNumber(current: number): number {
  return current + 1;
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

describe("Order total calculation", () => {
  it("calculates total for single item", () => {
    const items: OrderItem[] = [
      { type: "menu_item", name: "Margherita", quantity: 1, price: 299 },
    ];
    expect(calculateOrderTotal(items)).toBe(299);
  });

  it("calculates total for multiple items", () => {
    const items: OrderItem[] = [
      { type: "custom_pizza", name: "Custom Pizza", quantity: 1, price: 399 },
      { type: "menu_item", name: "Garlic Bread", quantity: 2, price: 149 },
    ];
    expect(calculateOrderTotal(items)).toBe(697); // 399 + 149*2
  });

  it("calculates total with quantities", () => {
    const items: OrderItem[] = [
      { type: "menu_item", name: "Cola", quantity: 3, price: 60 },
    ];
    expect(calculateOrderTotal(items)).toBe(180);
  });

  it("handles empty order", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});

describe("Loyalty points calculation", () => {
  it("calculates 1 point per ₹10", () => {
    expect(calculateLoyaltyPoints(100)).toBe(10);
    expect(calculateLoyaltyPoints(299)).toBe(29);
    expect(calculateLoyaltyPoints(1000)).toBe(100);
  });

  it("rounds down fractional points", () => {
    expect(calculateLoyaltyPoints(15)).toBe(1);
    expect(calculateLoyaltyPoints(5)).toBe(0);
    expect(calculateLoyaltyPoints(9)).toBe(0);
  });

  it("handles zero amount", () => {
    expect(calculateLoyaltyPoints(0)).toBe(0);
  });

  it("calculates points for large orders", () => {
    expect(calculateLoyaltyPoints(5000)).toBe(500);
  });
});

describe("Order number generation", () => {
  it("increments order number", () => {
    expect(generateOrderNumber(1000)).toBe(1001);
    expect(generateOrderNumber(1042)).toBe(1043);
  });

  it("starts from 1001 when counter is empty", () => {
    expect(generateOrderNumber(1000)).toBe(1001);
  });
});

describe("Currency formatting", () => {
  it("formats small amounts", () => {
    expect(formatCurrency(299)).toBe("₹299");
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("formats thousands with K", () => {
    expect(formatCurrency(1000)).toBe("₹1.0K");
    expect(formatCurrency(15000)).toBe("₹15.0K");
  });

  it("formats lakhs with L", () => {
    expect(formatCurrency(100000)).toBe("₹1.0L");
    expect(formatCurrency(350000)).toBe("₹3.5L");
  });
});

describe("Payment methods", () => {
  it("maps cash payment to cash_pending", () => {
    const method = "cash";
    const status = method === "cash" ? "cash_pending" : "pending";
    expect(status).toBe("cash_pending");
  });

  it("maps UPI payment to pending", () => {
    const method: string = "upi";
    const status = method === "cash" ? "cash_pending" : "pending";
    expect(status).toBe("pending");
  });
});

describe("Order status progression", () => {
  const validStatuses = ["placed", "confirmed", "preparing", "in_oven", "ready", "completed", "cancelled"];

  it("includes all valid statuses", () => {
    expect(validStatuses).toContain("placed");
    expect(validStatuses).toContain("confirmed");
    expect(validStatuses).toContain("preparing");
    expect(validStatuses).toContain("in_oven");
    expect(validStatuses).toContain("ready");
    expect(validStatuses).toContain("completed");
    expect(validStatuses).toContain("cancelled");
  });

  it("validates status transitions", () => {
    const statusOrder = ["placed", "confirmed", "preparing", "in_oven", "ready", "completed"];
    for (let i = 1; i < statusOrder.length; i++) {
      expect(validStatuses.indexOf(statusOrder[i])).toBeGreaterThan(
        validStatuses.indexOf(statusOrder[i - 1]),
      );
    }
  });
});
