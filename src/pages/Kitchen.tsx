import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Loader2,
  Volume2,
  VolumeX,
  Bell,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface OrderItem {
  type: string;
  name: string;
  quantity: number;
  price: number;
  customPizzaData?: {
    base: string;
    sauce: string;
    cheese: string;
    toppings: { name: string; price: number }[];
  };
}

type OrderStatus = "placed" | "confirmed" | "preparing" | "in_oven" | "ready" | "completed" | "cancelled";

export default function KitchenPage() {
  const activeOrders = useQuery(api.orders.getActiveOrders);
  const tables = useQuery(api.tables.getTables);
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const [muted, setMuted] = useState(false);
  const prevOrderCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound when new order arrives
  useEffect(() => {
    if (activeOrders && !muted) {
      const newCount = activeOrders.filter((o) => o.orderStatus === "placed").length;
      if (prevOrderCountRef.current > 0 && newCount > prevOrderCountRef.current) {
        // New order arrived - try to play notification sound
        try {
          if (!audioRef.current) {
            // Create a simple beep sound
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.2);
          }
        } catch {
          // Audio not available
        }
      }
      prevOrderCountRef.current = activeOrders.length;
    }
  }, [activeOrders, muted]);

  const getTableNumber = (tableId: string) => {
    const table = tables?.find((t) => t._id === tableId);
    return table?.tableNumber ?? "?";
  };

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

  if (activeOrders === undefined || tables === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const OrderCard = ({
    order,
    actions,
    highlight = false,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any;
    actions: { label: string; status: string; color: string }[];
    highlight?: boolean;
  }) => (
    <Card className={`border-2 ${highlight ? "border-yellow-400 shadow-lg shadow-yellow-100" : "border-border/50"}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              #{order.orderNumber}
            </span>
            <Badge className="text-lg px-3 py-1">
              Table {getTableNumber(order.tableId)}
            </Badge>
            {highlight && (
              <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                NEW
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-4">
          {order.items.map((item: OrderItem, i: number) => (
            <div key={i} className="text-sm">
              <p className="font-medium">
                {item.quantity}× {item.name}
              </p>
              {item.customPizzaData && (
                <div className="ml-4 text-xs text-muted-foreground space-y-0.5">
                  <p>🔸 {item.customPizzaData.base} Base</p>
                  <p>🔸 {item.customPizzaData.sauce} Sauce</p>
                  <p>🔸 {item.customPizzaData.cheese} Cheese</p>
                  {item.customPizzaData.toppings.map((t: { name: string; price: number }) => (
                    <p key={t.name}>🔸 {t.name}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            📝 {order.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              onClick={() =>
                updateStatus({
                  orderId: order._id,
                  status: action.status as OrderStatus,
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMuted(!muted)}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
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
                highlight={true}
                actions={[
                  {
                    label: "✓ Accept Order",
                    status: "confirmed",
                    color: "bg-green-600 hover:bg-green-700",
                  },
                ]}
              />
            ))}

            {/* Confirmed */}
            {confirmedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "🍳 Start Preparing",
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
                    label: "🔥 Into Oven",
                    status: "in_oven",
                    color: "fire-gradient text-white",
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
                    label: "✅ Ready to Serve",
                    status: "ready",
                    color: "bg-blue-600 hover:bg-blue-700",
                  },
                ]}
              />
            ))}

            {/* Ready */}
            {readyOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                actions={[
                  {
                    label: "🎉 Mark Complete",
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
