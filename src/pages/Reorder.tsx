import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Flame,
  Loader2,
  AlertTriangle,
  Check,
  ShoppingCart,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { useState } from "react";

export default function ReorderPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const tableId = searchParams.get("tableId");
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const originalOrder = useQuery(
    api.orders.getOrder,
    orderId ? { orderId: orderId as any } : "skip",
  );

  // Get current ingredient availability
  const bases = useQuery(api.pizzaBuilder.getBases);
  const sauces = useQuery(api.pizzaBuilder.getSauces);
  const cheeses = useQuery(api.pizzaBuilder.getCheeses);
  const toppings = useQuery(api.pizzaBuilder.getToppings);

  if (!originalOrder || !bases || !sauces || !cheeses || !toppings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Validate availability and prices for each item
  const validatedItems = originalOrder.items.map((item) => {
    if (item.type === "custom_pizza" && item.customPizzaData) {
      const d = item.customPizzaData;
      const base = bases.find((b) => b.name === d.base);
      const sauce = sauces.find((s) => s.name === d.sauce);
      const cheese = cheeses.find((c) => c.name === d.cheese);
      const availableToppings = d.toppings.filter((t) => {
        const tp = toppings.find((top) => top.name === t.name);
        return tp && tp.available && tp.stockQuantity > 0;
      });
      const unavailableToppings = d.toppings.filter((t) => {
        const tp = toppings.find((top) => top.name === t.name);
        return !tp || !tp.available || tp.stockQuantity <= 0;
      });

      const isBaseAvailable = base && base.available;
      const isSauceAvailable = sauce && sauce.available;
      const isCheeseAvailable = cheese && cheese.available;

      // Recalculate price with current prices
      const newPrice = (base?.price ?? 0) + (sauce?.price ?? 0) + (cheese?.price ?? 0) + availableToppings.reduce((s, t) => {
        const tp = toppings.find((top) => top.name === t.name);
        return s + (tp?.price ?? t.price);
      }, 0);

      const isFullyAvailable = isBaseAvailable && isSauceAvailable && isCheeseAvailable;

      return {
        ...item,
        validated: {
          isBaseAvailable,
          isSauceAvailable,
          isCheeseAvailable,
          availableToppings,
          unavailableToppings,
          newPrice,
          isFullyAvailable,
          originalPrice: item.price,
        },
      };
    }
    return { ...item, validated: null };
  });

  const handleReorder = () => {
    validatedItems.forEach((item) => {
      if (item.type === "custom_pizza" && item.customPizzaData && item.validated) {
        const v = item.validated;
        addItem({
          type: "custom_pizza",
          name: "Custom Wood-Fired Pizza",
          quantity: item.quantity,
          price: v.newPrice,
          customPizzaData: {
            base: item.customPizzaData.base,
            basePrice: bases.find((b) => b.name === item.customPizzaData!.base)?.price ?? 0,
            sauce: item.customPizzaData.sauce,
            saucePrice: sauces.find((s) => s.name === item.customPizzaData!.sauce)?.price ?? 0,
            cheese: item.customPizzaData.cheese,
            cheesePrice: cheeses.find((c) => c.name === item.customPizzaData!.cheese)?.price ?? 0,
            toppings: v.availableToppings.map((t) => ({
              name: t.name,
              price: toppings.find((top) => top.name === t.name)?.price ?? t.price,
            })),
          },
        });
      } else if (item.type === "menu_item") {
        addItem({
          type: "menu_item",
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          menuItemId: item.menuItemId,
        });
      }
    });
    setAdded(true);
    setTimeout(() => {
      navigate(`/cart${tableId ? `?tableId=${tableId}` : ""}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold">Reorder</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <h2 className="text-xl font-bold">Reorder from #{originalOrder.orderNumber}</h2>

        {validatedItems.map((item, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{item.name}</h3>
                <span className="font-bold text-primary">₹{item.validated?.newPrice ?? item.price}</span>
              </div>
              {item.type === "custom_pizza" && item.validated && (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base: {item.customPizzaData!.base}</span>
                    {item.validated.isBaseAvailable ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sauce: {item.customPizzaData!.sauce}</span>
                    {item.validated.isSauceAvailable ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cheese: {item.customPizzaData!.cheese}</span>
                    {item.validated.isCheeseAvailable ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                    )}
                  </div>
                  {item.validated.availableToppings.length > 0 && (
                    <p className="text-muted-foreground">
                      Toppings: {item.validated.availableToppings.map((t) => t.name).join(", ")}
                    </p>
                  )}
                  {item.validated.unavailableToppings.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Unavailable: {item.validated.unavailableToppings.map((t) => t.name).join(", ")}</span>
                    </div>
                  )}
                  {item.validated.newPrice !== item.validated.originalPrice && (
                    <p className="text-xs text-muted-foreground">
                      Price updated: ₹{item.validated.originalPrice} → ₹{item.validated.newPrice}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={handleReorder}
          disabled={added}
          className={`w-full h-12 text-base ${added ? "bg-green-600" : "fire-gradient"} text-white`}
          size="lg"
        >
          {added ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add All to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
