import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Flame,
  Pizza,
  Star,
  ArrowRight,
  ShoppingCart,
  Trophy,
  Clock,
  RotateCcw,
  Utensils,
  Gift,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useCallback, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  const menuItems = useQuery(api.menu.getMenuItems, {});
  const latestOrder = useQuery(
    api.orders.getLatestOrderForUser,
    user?._id ? { userId: user._id } : "skip",
  );
  const userPoints = useQuery(
    api.loyalty.getUserPoints,
    user?._id ? { userId: user._id } : "skip",
  );
  const hallOfFame = useQuery(api.hallOfFame.getPublishedWinners);
  const incrementVisit = useMutation(api.tables.incrementVisit);

  // Increment visit count on first load
  useEffect(() => {
    if (user?._id) {
      incrementVisit({ userId: user._id });
    }
  }, [user?._id]);

  const featuredItems = (menuItems ?? [])
    .filter((item) => item.category === "Signature Pizzas")
    .slice(0, 4);

  const signaturePizzas = (menuItems ?? []).filter(
    (item) => item.category === "Signature Pizzas",
  );
  const sides = (menuItems ?? []).filter((item) => item.category === "Sides");
  const beverages = (menuItems ?? []).filter(
    (item) => item.category === "Beverages",
  );

  const addToCart = useCallback(
    (item: (typeof menuItems extends (infer T)[] | undefined ? T : never)) => {
      // This is handled via CartContext - we need to expose it
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary animate-flame" />
            <span className="font-bold text-lg">MYOP</span>
          </div>
          <div className="flex items-center gap-3">
            {tableId && (
              <Badge variant="secondary" className="text-xs">
                Table #{tableId.slice(-2)}
              </Badge>
            )}
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
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 space-y-8 mt-6">
        {/* Welcome & Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {user?.name ? `Welcome, ${user.name}!` : "Welcome!"}
          </h1>
          {tableId && (
            <p className="text-muted-foreground">
              You're ordering from <span className="font-semibold text-foreground">Table {tableId.slice(-2)}</span>
            </p>
          )}
        </motion.div>

        {/* Loyalty Card */}
        {userPoints && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-primary/20">
              <div className="fire-gradient p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium">Loyalty Points</p>
                    <p className="text-3xl font-bold">{userPoints.pointsBalance}</p>
                    <p className="text-white/70 text-sm mt-1">{userPoints.visitCount} visits</p>
                  </div>
                  <div className="text-right">
                    <Gift className="h-10 w-10 text-white/50" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Build Your Pizza CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to={`/pizza-builder${tableId ? `?tableId=${tableId}` : ""}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-primary/30">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 text-center relative">
                <div className="absolute top-4 right-4">
                  <Badge className="fire-gradient text-white border-0">★ Hero</Badge>
                </div>
                <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
                  🍕
                </span>
                <h2 className="text-2xl font-bold mb-2">Build Your Own Pizza</h2>
                <p className="text-muted-foreground mb-4">
                  Choose your base, sauce, cheese & toppings
                </p>
                <Button className="fire-gradient text-white shadow-lg group-hover:shadow-xl transition-all">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Reorder */}
        {latestOrder && latestOrder.orderStatus === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Order My Last Pizza</p>
                    <p className="text-xs text-muted-foreground">
                      {latestOrder.items
                        .filter((i) => i.type === "custom_pizza")
                        .map((i) => i.name)
                        .join(", ") || "Previous order"}{" "}
                      • ₹{latestOrder.totalAmount}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/reorder?orderId=${latestOrder._id}${tableId ? `&tableId=${tableId}` : ""}`}
                >
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reorder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Order Status */}
        {latestOrder &&
          latestOrder.orderStatus !== "completed" &&
          latestOrder.orderStatus !== "cancelled" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Link to={`/order/${latestOrder._id}`}>
                <Card className="border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Active Order #{latestOrder.orderNumber}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {latestOrder.orderStatus.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}

        {/* Signature Pizzas */}
        {signaturePizzas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Signature Pizzas</h2>
              <Link to="/menu" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {signaturePizzas.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden hover:shadow-md transition-all border-border/50"
                >
                  <div className="flex">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-4xl">🍕</span>
                    </div>
                    <CardContent className="p-4 flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">₹{item.price}</span>
                        <Link
                          to={`/menu`}
                        >
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Link to={`/pizza-builder${tableId ? `?tableId=${tableId}` : ""}`}>
            <Card className="text-center p-4 hover:shadow-md transition-all cursor-pointer border-border/50">
              <Pizza className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Custom Pizza</p>
            </Card>
          </Link>
          <Link to="/menu">
            <Card className="text-center p-4 hover:shadow-md transition-all cursor-pointer border-border/50">
              <Utensils className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Full Menu</p>
            </Card>
          </Link>
          <Link to="/loyalty">
            <Card className="text-center p-4 hover:shadow-md transition-all cursor-pointer border-border/50">
              <Star className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Rewards</p>
            </Card>
          </Link>
          <Link to="/hall-of-fame">
            <Card className="text-center p-4 hover:shadow-md transition-all cursor-pointer border-border/50">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Hall of Fame</p>
            </Card>
          </Link>
        </motion.div>

        {/* Hall of Fame Preview */}
        {hallOfFame && hallOfFame.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🏆 Hall of Fame</h2>
              <Link to="/hall-of-fame" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {hallOfFame.slice(0, 3).map((winner) => (
                <Card
                  key={winner._id}
                  className="min-w-[160px] text-center border-border/50 shrink-0"
                >
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <span className="font-bold text-primary">
                        {winner.displayName.charAt(0)}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{winner.displayName}</p>
                    <p className="text-xs text-muted-foreground">{winner.visitCount} visits</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {winner.prizeTitle}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Restaurant Info */}
        <Card className="border-border/50">
          <CardContent className="p-6 text-center">
            <p className="font-bold mb-1">Make Your Own Pizza</p>
            <p className="text-sm text-muted-foreground mb-2">
              123 Pizza Lane, Food Street • 11 AM - 11 PM
            </p>
            <p className="text-xs text-muted-foreground">
              Dine-in only • Wood-fired pizzas • Scan QR at your table
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
