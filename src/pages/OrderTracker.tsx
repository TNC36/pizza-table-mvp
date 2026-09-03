import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Check,
  Clock,
  ChefHat,
  FlameKindling,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: Check },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "in_oven", label: "In the Wood-Fired Oven", icon: FlameKindling },
  { key: "ready", label: "Ready!", icon: PartyPopper },
];

const STATUS_ORDER = ["placed", "confirmed", "preparing", "in_oven", "ready"];

function getStatusIndex(status: string) {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderTracker() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const order = useQuery(
    api.orders.getOrder,
    orderId ? { orderId: orderId as any } : "skip",
  );
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const currentIdx = getStatusIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold">Order #{order.orderNumber}</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Order Complete */}
        {order.orderStatus === "ready" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <span className="text-6xl block mb-3">🎉</span>
            <h2 className="text-2xl font-bold mb-1">Your Pizza is Ready!</h2>
            <p className="text-muted-foreground">
              Please collect from the counter or inform the staff.
            </p>
          </motion.div>
        )}

        {/* Progress Tracker */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i < currentIdx;
                const isCurrent = i === currentIdx;
                const isFuture = i > currentIdx;
                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Line + Circle */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted || isCurrent
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "animate-pulse ring-4 ring-primary/20" : ""}`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : isCurrent ? (
                          <step.icon className="h-5 w-5" />
                        ) : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                      </motion.div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            isCompleted ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pt-2 pb-2">
                      <p
                        className={`font-medium ${
                          isCompleted || isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-primary mt-0.5"
                        >
                          In progress...
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold mb-2">Order Details</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.customPizzaData && (
                    <p className="text-xs text-muted-foreground">
                      {item.customPizzaData.base} + {item.customPizzaData.sauce} + {item.customPizzaData.cheese}
                      {item.customPizzaData.toppings.length > 0 &&
                        ` + ${item.customPizzaData.toppings.map((t) => t.name).join(", ")}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Payment</span>
              <Badge variant="outline" className="capitalize">
                {order.paymentMethod?.replace("_", " ") ?? "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
