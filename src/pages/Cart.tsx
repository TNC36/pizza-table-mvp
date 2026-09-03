import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Trash2, Flame, Banknote,
  Loader2, Check, Minus, Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const placeOrder = useMutation(api.orders.placeOrder);
  const tables = useQuery(api.tables.getTables);
  const restaurant = useQuery(api.restaurant.getSettings);
  const resolvedTable = tableId ? tables?.find((t) => t._id === tableId) : null;

  const gstPercent = restaurant?.gstPercent ?? 5;
  const gstAmount = Math.round(total * gstPercent / 100);
  const grandTotal = total + gstAmount;

  const handlePlaceOrder = async () => {
    if (!user?._id || !resolvedTable) {
      toast.error("Please ensure your table is selected");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsPlacing(true);
    try {
      const result = await placeOrder({
        tableId: resolvedTable._id,
        items: items.map((item) => ({
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customPizzaData: item.customPizzaData,
          menuItemId: item.menuItemId as unknown as Id<"menuItems"> | undefined,
        })),
        paymentMethod: "cash",
        notes: notes || undefined,
      });
      clearCart();
      setIsConfirmed(true);
      toast.success(`Order #${result.orderNumber} placed!`);
      setTimeout(() => navigate(`/order/${result.orderId}`), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-muted-foreground">Your pizza is being prepared. Redirecting to tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold">Your Order</span>
          {resolvedTable && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Table #{resolvedTable.tableNumber}
            </Badge>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🛒</span>
            <h2 className="text-xl font-bold mb-2">Cart is Empty</h2>
            <p className="text-muted-foreground mb-4">Add some delicious items to get started</p>
            <Button onClick={() => navigate(-1)}>Browse Menu</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <Card key={item.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.type === "custom_pizza" ? "🍕" : "🍽️"}</span>
                          <h3 className="font-bold text-sm">{item.name}</h3>
                        </div>
                        {item.customPizzaData && (
                          <p className="text-xs text-muted-foreground mt-1 ml-7">
                            {item.customPizzaData.base} + {item.customPizzaData.sauce} + {item.customPizzaData.cheese}
                            {item.customPizzaData.toppings.length > 0 && ` + ${item.customPizzaData.toppings.map((t) => t.name).join(", ")}`}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 ml-7">
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold">₹{item.price * item.quantity}</p>
                        <Button variant="ghost" size="sm" className="h-6 text-destructive mt-1" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Notes */}
            <Card className="mb-6 border-border/50">
              <CardContent className="p-4">
                <p className="font-bold text-sm mb-2">Order Notes (Optional)</p>
                <Textarea
                  placeholder="e.g. Less spicy, Extra crispy, No onions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Payment - Cash Only (Dine-in) */}
            <Card className="mb-6 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pay at Table</p>
                    <p className="text-xs text-muted-foreground">Cash payment collected at your table</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="mb-6 border-border/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl text-primary">₹{grandTotal}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacing || !resolvedTable}
              className="w-full fire-gradient text-white shadow-lg h-12 text-base"
              size="lg"
            >
              {isPlacing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Placing Order...</>
              ) : (
                <>Place Order — ₹{grandTotal}</>
              )}
            </Button>
            {!resolvedTable && (
              <div className="mt-4 space-y-3">
                <p className="text-center text-sm text-destructive font-medium">
                  Please select your table to place an order
                </p>
                {tables === undefined ? (
                  <div className="h-10 bg-muted rounded animate-pulse" />
                ) : (
                  <Select onValueChange={(val) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("tableId", val);
                    navigate(`/cart?${params.toString()}`, { replace: true });
                    const tbl = tables?.find((t) => t._id === val);
                    toast.success(`Table ${tbl?.tableNumber ?? val} selected`);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your table..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.filter((t) => t.active).map((table) => (
                        <SelectItem key={table._id} value={table._id}>
                          Table {table.tableNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
