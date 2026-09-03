import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Flame,
  Check,
  ChefHat,
  FlameKindling,
  PartyPopper,
  Clock,
  Loader2,
} from "lucide-react";

export default function KitchenPage() {
  const activeOrders = useQuery(api.orders.getActiveOrders);
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const placedOrders = (activeOrders ?? []).filter(
    (o) => o.orderStatus === "placed",
  );
  const confirmedOrders = (activeOrders ?? []).filter(
    (o) => o.orderStatus === "confirmed",
  );
  const preparingOrders = (activeOrders ?? []).filter(
    (o) => o.orderStatus === "preparing",
  );
  const ovenOrders = (activeOrders ?? []).filter(
    (o) => o.orderStatus === "in_oven",
  );
  const readyOrders = (activeOrders ?? []).filter(
    (o) => o.orderStatus === "ready",
  );

  if (activeOrders === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const OrderCard = ({
    order,
    actions,
  }: {
    order: any;
    actions: { label: string; status: string; color: string }[];
  }) => (
    <Card className="border-2 border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              #{order.orderNumber}
            </span>
            <Badge className="text-lg px-3 py-1">
              Table {(() => {
                const tables = activeOrders;
                return "...";
              })()}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="text-sm">
              <p className="font-medium">
                {item.quantity}× {item.name}
              </p>
              {item.customPizzaData && (
                <div className="ml-4 text-xs text-muted-foreground space-y-0.5">
                  <p>🔸 {item.customPizzaData.base} Base</p>
                  <p>🔸 {item.customPizzaData.sauce} Sauce</p>
                  <p>🔸 {item.customPizzaData.cheese} Cheese</p>
                  {item.customPizzaData.toppings.map((t: any) => (
                    <p key={t.name}>🔸 {t.name}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              onClick={() =>
                updateStatus({
                  orderId: order._id,
                  status: action.status as any,
                })
              }
              className={`flex-1 ${action.color} text-white`}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Flame className="h-6 w-6 text-primary animate-flame" />
          <span className="font-bold text-xl">Kitchen Display</span>
          <Badge variant="secondary" className="ml-auto">
            {activeOrders.length} active orders
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {activeOrders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">👨‍🍳</span>
            <p className="text-xl font-bold mb-1">No Active Orders</p>
            <p className="text-muted-foreground">Waiting for new orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New Orders */}
            {placedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "✓ Accept Order",
                    status: "confirmed",
                    color: "bg-green-600 hover:bg-green-700",
                  },
                ]}
              />
            ))}

            {/* Confirmed - Ready to Prep */}
            {confirmedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "👨‍🍳 Start Preparation",
                    status: "preparing",
                    color: "bg-amber-600 hover:bg-amber-700",
                  },
                ]}
              />
            ))}

            {/* Preparing */}
            {preparingOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "🔥 Send to Oven",
                    status: "in_oven",
                    color: "fire-gradient hover:opacity-90",
                  },
                ]}
              />
            ))}

            {/* In Oven */}
            {ovenOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "✅ Mark Ready",
                    status: "ready",
                    color: "bg-blue-600 hover:bg-blue-700",
                  },
                ]}
              />
            ))}

            {/* Ready for Pickup */}
            {readyOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "🎉 Complete",
                    status: "completed",
                    color: "bg-green-700 hover:bg-green-800",
                  },
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
