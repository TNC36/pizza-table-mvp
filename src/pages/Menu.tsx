import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Flame,
  Plus,
  Check,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";

const CATEGORIES = ["Signature Pizzas", "Classic Pizzas", "Sides", "Desserts", "Beverages"];

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const menuItems = useQuery(api.menu.getMenuItems, {});
  const filteredItems = (menuItems ?? []).filter(
    (item) => item.category === activeCategory,
  );

  const handleAdd = useCallback(
    (item: (typeof menuItems extends (infer T)[] | undefined ? T : never)) => {
      addItem({
        type: "menu_item",
        name: item.name,
        quantity: 1,
        price: item.price,
        menuItemId: item._id,
      });
      setAddedItems((prev) => new Set(prev).add(item._id));
      setTimeout(() => {
        setAddedItems((prev) => {
          const next = new Set(prev);
          next.delete(item._id);
          return next;
        });
      }, 1500);
    },
    [addItem],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/home${tableId ? `?tableId=${tableId}` : ""}`)
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-bold">Menu</span>
            </div>
          </div>
          <Link to="/cart" className="relative">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="text-xl font-bold mb-4">{activeCategory}</h2>
        {menuItems === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No items in this category yet
          </p>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, i) => {
              const isAdded = addedItems.has(item._id);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-3xl">
                          {item.category.includes("Pizza") ? "🍕" :
                           item.category === "Sides" ? "🧅" :
                           item.category === "Desserts" ? "🍰" : "🥤"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold">{item.name}</h3>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-primary whitespace-nowrap">
                            ₹{item.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {item.available ? (
                            <Badge variant="secondary" className="text-xs">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Sold Out
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant={isAdded ? "default" : "outline"}
                            onClick={() => !isAdded && handleAdd(item)}
                            disabled={!item.available || isAdded}
                            className={isAdded ? "fire-gradient text-white" : ""}
                          >
                            {isAdded ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
