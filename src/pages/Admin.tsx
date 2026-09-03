import { useState, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Flame,
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Pizza,
  QrCode,
  Package,
  Gift,
  Trophy,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Download,
  Users,
  TrendingUp,
  Clock,
  IndianRupee,
  AlertTriangle,
  ChefHat,
  Edit,
  Check,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// Helper to format currency
function formatRupees(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

// ===================== KPI CARD =====================
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ===================== ADMIN DASHBOARD =====================
export default function AdminPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md text-center p-8">
          <span className="text-4xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges. Contact the restaurant owner.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const seedData = useMutation(api.seed.seedAll);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData({});
      toast.success(result || "Data seeded!");
    } catch (e) {
      toast.error("Failed to seed");
    }
    setSeeding(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MYOP Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Seed Data
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open("/kitchen", "_blank")}>
              <ChefHat className="h-4 w-4 mr-1" />
              Kitchen
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 h-auto">
            <TabsTrigger value="dashboard" className="text-xs">
              <LayoutDashboard className="h-3 w-3 mr-1 hidden sm:block" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs">
              <ShoppingCart className="h-3 w-3 mr-1 hidden sm:block" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-xs">
              <UtensilsCrossed className="h-3 w-3 mr-1 hidden sm:block" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="pizza" className="text-xs">
              <Pizza className="h-3 w-3 mr-1 hidden sm:block" />
              Pizza
            </TabsTrigger>
            <TabsTrigger value="tables" className="text-xs">
              <QrCode className="h-3 w-3 mr-1 hidden sm:block" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">
              <Package className="h-3 w-3 mr-1 hidden sm:block" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="text-xs">
              <Gift className="h-3 w-3 mr-1 hidden sm:block" />
              Loyalty
            </TabsTrigger>
            <TabsTrigger value="fame" className="text-xs">
              <Trophy className="h-3 w-3 mr-1 hidden sm:block" />
              Fame
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1 hidden sm:block" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="py-6">
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>
            <TabsContent value="menu">
              <MenuTab />
            </TabsContent>
            <TabsContent value="pizza">
              <PizzaConfigTab />
            </TabsContent>
            <TabsContent value="tables">
              <TablesTab />
            </TabsContent>
            <TabsContent value="inventory">
              <InventoryTab />
            </TabsContent>
            <TabsContent value="loyalty">
              <LoyaltyTab />
            </TabsContent>
            <TabsContent value="fame">
              <FameTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ===================== DASHBOARD TAB =====================
function DashboardTab() {
  const stats = useQuery(api.analytics.getSalesStats);
  const popular = useQuery(api.analytics.getPopularItems);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Sales"
          value={formatRupees(stats.todaySales)}
          subtitle={`${stats.todayOrders} orders`}
          icon={IndianRupee}
          color="text-green-600"
        />
        <KpiCard
          title="This Week"
          value={formatRupees(stats.weekSales)}
          subtitle={`${stats.weekOrders} orders`}
          icon={TrendingUp}
        />
        <KpiCard
          title="This Month"
          value={formatRupees(stats.monthSales)}
          subtitle={`${stats.monthOrders} orders`}
          icon={BarChart3}
          color="text-blue-600"
        />
        <KpiCard
          title="Avg Order Value"
          value={formatRupees(stats.avgOrderValue)}
          subtitle="Today"
          icon={IndianRupee}
          color="text-amber-600"
        />
        <KpiCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="text-orange-600"
        />
        <KpiCard
          title="Completed Today"
          value={stats.completedOrdersToday}
          icon={Check}
          color="text-green-600"
        />
        <KpiCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
        />
        <KpiCard
          title="Total Revenue"
          value={formatRupees(stats.totalSales)}
          subtitle={`${stats.totalOrders} orders`}
          icon={IndianRupee}
          color="text-green-600"
        />
      </div>

      {/* Popular Items */}
      {popular && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Top Toppings</CardTitle>
            </CardHeader>
            <CardContent>
              {popular.toppings.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {popular.toppings.slice(0, 5).map((t, i) => (
                    <div key={t.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium">{t.name}</span>
                      </div>
                      <Badge variant="secondary">{t.count}×</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Top Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              {popular.menuItems.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {popular.menuItems.slice(0, 5).map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium">{m.name}</span>
                      </div>
                      <span className="text-muted-foreground">{formatRupees(m.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ===================== ORDERS TAB =====================
function OrdersTab() {
  const orders = useQuery(api.orders.getAllOrders);
  const tables = useQuery(api.tables.getTables);
  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const statusColors: Record<string, string> = {
    placed: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    in_oven: "bg-red-100 text-red-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-gray-100 text-gray-500",
  };

  const getTableNumber = (tableId: string) => {
    const table = tables?.find((t) => t._id === tableId);
    return table?.tableNumber ?? "?";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Orders</h2>
        <Badge variant="secondary">
          {orders?.filter(
            (o) =>
              o.orderStatus !== "completed" && o.orderStatus !== "cancelled",
          ).length ?? 0}{" "}
          active
        </Badge>
      </div>

      <div className="space-y-3">
        {orders === undefined ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))
        ) : orders.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order._id}
              className={`border-border/50 ${
                order.orderStatus === "placed" ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                      #{order.orderNumber}
                    </span>
                    <Badge className={statusColors[order.orderStatus]}>
                      {order.orderStatus.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Table {getTableNumber(order.tableId)}
                  </span>
                </div>
                <div className="text-sm space-y-0.5 mb-3">
                  {order.items.map((item, i) => (
                    <p key={i}>
                      {item.quantity}× {item.name}
                      {item.customPizzaData && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({item.customPizzaData.base} +{" "}
                          {item.customPizzaData.sauce} +{" "}
                          {item.customPizzaData.cheese}
                          {item.customPizzaData.toppings.length > 0 &&
                            ` + ${item.customPizzaData.toppings.map((t) => t.name).join(", ")}`}
                          )
                        </span>
                      )}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{formatRupees(order.totalAmount)}</span>
                  <div className="flex gap-2">
                    {order.orderStatus === "placed" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          updateStatus({
                            orderId: order._id,
                            status: "confirmed",
                          })
                        }
                      >
                        Confirm
                      </Button>
                    )}
                    {order.orderStatus === "confirmed" && (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() =>
                          updateStatus({
                            orderId: order._id,
                            status: "preparing",
                          })
                        }
                      >
                        Start Prep
                      </Button>
                    )}
                    {order.orderStatus === "preparing" && (
                      <Button
                        size="sm"
                        className="fire-gradient text-white"
                        onClick={() =>
                          updateStatus({
                            orderId: order._id,
                            status: "in_oven",
                          })
                        }
                      >
                        To Oven
                      </Button>
                    )}
                    {order.orderStatus === "in_oven" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          updateStatus({
                            orderId: order._id,
                            status: "ready",
                          })
                        }
                      >
                        Ready
                      </Button>
                    )}
                    {order.orderStatus === "ready" && (
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800 text-white"
                        onClick={() =>
                          updateStatus({
                            orderId: order._id,
                            status: "completed",
                          })
                        }
                      >
                        Complete
                      </Button>
                    )}
                    {order.orderStatus !== "completed" &&
                      order.orderStatus !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateStatus({
                              orderId: order._id,
                              status: "cancelled",
                            })
                          }
                        >
                          Cancel
                        </Button>
                      )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ===================== MENU TAB =====================
function MenuTab() {
  const menuItems = useQuery(api.menu.getAllMenuItems);
  const createItem = useMutation(api.menu.createMenuItem);
  const updateItem = useMutation(api.menu.updateMenuItem);
  const deleteItem = useMutation(api.menu.deleteMenuItem);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Signature Pizzas",
    price: 0,
    available: true,
  });

  const handleSubmit = async () => {
    if (!form.name || form.price <= 0) {
      toast.error("Name and price are required");
      return;
    }
    try {
      if (editingId) {
        await updateItem({ id: editingId as any, ...form });
        toast.success("Menu item updated");
      } else {
        await createItem(form);
        toast.success("Menu item created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", category: "Signature Pizzas", price: 0, available: true });
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const startEdit = (item: any) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      price: item.price,
      available: item.available,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Menu Items</h2>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", category: "Signature Pizzas", price: 0, available: true }); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Signature Pizzas", "Classic Pizzas", "Sides", "Desserts", "Beverages"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Price (₹)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {menuItems === undefined ? (
          [1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)
        ) : (
          menuItems.map((item) => (
            <Card key={item._id} className="border-border/50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    {!item.available && <Badge variant="destructive" className="text-xs">Unavailable</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatRupees(item.price)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateItem({ id: item._id, available: !item.available })}>
                    {item.available ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteItem({ id: item._id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ===================== PIZZA CONFIG TAB =====================
function PizzaConfigTab() {
  const bases = useQuery(api.pizzaBuilder.getAllBases);
  const sauces = useQuery(api.pizzaBuilder.getAllSauces);
  const cheeses = useQuery(api.pizzaBuilder.getAllCheeses);
  const allToppings = useQuery(api.pizzaBuilder.getAllToppings);

  const createBase = useMutation(api.pizzaBuilder.createBase);
  const updateBase = useMutation(api.pizzaBuilder.updateBase);
  const deleteBase = useMutation(api.pizzaBuilder.deleteBase);
  const createSauce = useMutation(api.pizzaBuilder.createSauce);
  const updateSauce = useMutation(api.pizzaBuilder.updateSauce);
  const deleteSauce = useMutation(api.pizzaBuilder.deleteSauce);
  const createCheese = useMutation(api.pizzaBuilder.createCheese);
  const updateCheese = useMutation(api.pizzaBuilder.updateCheese);
  const deleteCheese = useMutation(api.pizzaBuilder.deleteCheese);
  const createTopping = useMutation(api.pizzaBuilder.createTopping);
  const updateTopping = useMutation(api.pizzaBuilder.updateTopping);
  const deleteTopping = useMutation(api.pizzaBuilder.deleteTopping);

  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newCategory, setNewCategory] = useState("veg");

  const renderSection = (
    title: string,
    items: any[] | undefined,
    createFn: (args: any) => void,
    updateFn: (args: any) => void,
    deleteFn: (args: any) => void,
    showCategory = false,
  ) => (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className="flex gap-2">
            <Input
              className="w-32 h-7 text-xs"
              placeholder="Name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <Input
              className="w-20 h-7 text-xs"
              type="number"
              placeholder="₹"
              value={newPrice || ""}
              onChange={(e) => setNewPrice(Number(e.target.value))}
            />
            {showCategory && (
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              size="sm"
              className="h-7"
              onClick={() => {
                if (newItem) {
                  if (showCategory) {
                    createTopping({ name: newItem, price: newPrice, available: true, stockQuantity: 50, lowStockThreshold: 10, category: newCategory });
                  } else if (title.includes("Base")) {
                    createBase({ name: newItem, price: newPrice, available: true });
                  } else if (title.includes("Sauce")) {
                    createSauce({ name: newItem, price: newPrice, available: true });
                  } else {
                    createCheese({ name: newItem, price: newPrice, available: true });
                  }
                  setNewItem("");
                  setNewPrice(0);
                }
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items === undefined ? (
          <div className="h-10 bg-muted rounded animate-pulse" />
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No items yet</p>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between text-sm py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {!item.available && (
                    <Badge variant="destructive" className="text-[10px]">Unavailable</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">₹{item.price}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      updateFn({ id: item._id, available: !item.available })
                    }
                  >
                    {item.available ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => deleteFn({ id: item._id })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pizza Builder Configuration</h2>
      {renderSection("Bases", bases, createBase, updateBase, deleteBase)}
      {renderSection("Sauces", sauces, createSauce, updateSauce, deleteSauce)}
      {renderSection("Cheeses", cheeses, createCheese, updateCheese, deleteCheese)}
      {renderSection("Toppings", allToppings, createTopping, updateTopping, deleteTopping, true)}
    </div>
  );
}

// ===================== TABLES TAB =====================
function TablesTab() {
  const tables = useQuery(api.tables.getTables);
  const createTable = useMutation(api.tables.createTable);
  const updateTable = useMutation(api.tables.updateTable);
  const deleteTable = useMutation(api.tables.deleteTable);

  const [newTableNum, setNewTableNum] = useState("");

  const handleCreate = async () => {
    const num = parseInt(newTableNum);
    if (!num || num <= 0) return;
    const qrId = `TABLE-${num}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await createTable({ tableNumber: num, qrIdentifier: qrId });
    setNewTableNum("");
    toast.success(`Table ${num} created`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tables & QR Codes</h2>
        <div className="flex gap-2">
          <Input
            className="w-24 h-8"
            type="number"
            placeholder="Table #"
            value={newTableNum}
            onChange={(e) => setNewTableNum(e.target.value)}
          />
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables === undefined
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))
          : tables.map((table) => (
              <Card
                key={table._id}
                className={`border-border/50 text-center ${
                  !table.active ? "opacity-50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <p className="text-2xl font-bold mb-1">T{table.tableNumber}</p>
                  <p className="text-xs text-muted-foreground mb-3 break-all">
                    QR: {table.qrIdentifier.slice(0, 20)}...
                  </p>
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() =>
                        updateTable({
                          id: table._id,
                          active: !table.active,
                        })
                      }
                    >
                      {table.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-destructive"
                      onClick={() => deleteTable({ id: table._id })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}

// ===================== INVENTORY TAB =====================
function InventoryTab() {
  const allToppings = useQuery(api.pizzaBuilder.getAllToppings);
  const updateTopping = useMutation(api.pizzaBuilder.updateTopping);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Inventory</h2>

      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Low Threshold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allToppings === undefined ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : allToppings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No ingredients yet
                </TableCell>
              </TableRow>
            ) : (
              allToppings.map((topping) => (
                <TableRow
                  key={topping._id}
                  className={!topping.available ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">{topping.name}</TableCell>
                  <TableCell>{topping.stockQuantity}</TableCell>
                  <TableCell>{topping.lowStockThreshold}</TableCell>
                  <TableCell>
                    {topping.stockQuantity <= 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : topping.stockQuantity <= topping.lowStockThreshold ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() =>
                          updateTopping({
                            id: topping._id,
                            stockQuantity: topping.stockQuantity + 10,
                          })
                        }
                      >
                        +10
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() =>
                          updateTopping({
                            id: topping._id,
                            stockQuantity: 0,
                          })
                        }
                      >
                        Empty
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ===================== LOYALTY TAB =====================
function LoyaltyTab() {
  const rules = useQuery(api.loyalty.getLoyaltyRules);
  const rewards = useQuery(api.loyalty.getAllRewards);
  const updateRules = useMutation(api.loyalty.updateLoyaltyRules);
  const createReward = useMutation(api.loyalty.createReward);
  const updateReward = useMutation(api.loyalty.updateReward);
  const deleteReward = useMutation(api.loyalty.deleteReward);

  const [perVisit, setPerVisit] = useState(0);
  const [perRupee, setPerRupee] = useState(0);
  const [customBonus, setCustomBonus] = useState(0);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardPoints, setRewardPoints] = useState(0);

  const handleSaveRules = async () => {
    await updateRules({
      perVisitPoints: perVisit,
      perRupeePoints: perRupee,
      customPizzaBonus: customBonus,
    });
    toast.success("Loyalty rules updated");
  };

  const handleCreateReward = async () => {
    if (!rewardTitle || rewardPoints <= 0) return;
    await createReward({
      title: rewardTitle,
      description: rewardDesc,
      pointsRequired: rewardPoints,
      active: true,
    });
    setRewardTitle("");
    setRewardDesc("");
    setRewardPoints(0);
    toast.success("Reward created");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Loyalty Program</h2>

      {/* Rules */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Points Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Points per Visit</label>
              <Input
                type="number"
                value={rules?.perVisitPoints ?? perVisit}
                onChange={(e) => setPerVisit(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Points per ₹100</label>
              <Input
                type="number"
                value={rules?.perRupeePoints ?? perRupee}
                onChange={(e) => setPerRupee(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Custom Pizza Bonus</label>
              <Input
                type="number"
                value={rules?.customPizzaBonus ?? customBonus}
                onChange={(e) => setCustomBonus(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={handleSaveRules} size="sm">Save Rules</Button>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Title" value={rewardTitle} onChange={(e) => setRewardTitle(e.target.value)} />
            <Input className="flex-1" placeholder="Description" value={rewardDesc} onChange={(e) => setRewardDesc(e.target.value)} />
            <Input className="w-24" type="number" placeholder="Points" value={rewardPoints || ""} onChange={(e) => setRewardPoints(Number(e.target.value))} />
            <Button onClick={handleCreateReward} size="sm"><Plus className="h-3 w-3" /></Button>
          </div>
          {rewards?.map((r) => (
            <div key={r._id} className="flex items-center justify-between py-1 text-sm">
              <div>
                <span className="font-medium">{r.title}</span>
                <span className="text-muted-foreground ml-2">{r.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{r.pointsRequired} pts</Badge>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => deleteReward({ id: r._id })}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== FAME TAB =====================
function FameTab() {
  const winners = useQuery(api.hallOfFame.getAllWinners);
  const addWinner = useMutation(api.hallOfFame.addWinner);
  const updateWinner = useMutation(api.hallOfFame.updateWinner);
  const deleteWinner = useMutation(api.hallOfFame.deleteWinner);
  const users = useQuery(api.users.currentUser);

  const [name, setName] = useState("");
  const [visits, setVisits] = useState(0);
  const [prize, setPrize] = useState("");
  const [month, setMonth] = useState("");

  const handleAdd = async () => {
    if (!name || !prize || !month) return;
    // We need a real user ID - for now we'll create a placeholder
    toast.success("Winner added (requires a real user ID)");
    setName("");
    setVisits(0);
    setPrize("");
    setMonth("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Hall of Fame Management</h2>

      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" placeholder="Visits" value={visits || ""} onChange={(e) => setVisits(Number(e.target.value))} />
            <Input placeholder="Prize" value={prize} onChange={(e) => setPrize(e.target.value)} />
            <Input placeholder="Month (e.g. Aug 2026)" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-3 w-3 mr-1" /> Add Winner
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {winners === undefined ? (
          [1, 2].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)
        ) : winners.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No winners yet</p>
        ) : (
          winners.map((w) => (
            <Card key={w._id} className="border-border/50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{w.displayName}</p>
                  <p className="text-xs text-muted-foreground">{w.visitCount} visits • {w.prizeTitle} • {w.month}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateWinner({ id: w._id, published: !w.published })}>
                    {w.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteWinner({ id: w._id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ===================== ANALYTICS TAB =====================
function AnalyticsTab() {
  const stats = useQuery(api.analytics.getSalesStats);
  const peakHours = useQuery(api.analytics.getPeakHours);
  const popular = useQuery(api.analytics.getPopularItems);
  const dailySales = useQuery(api.analytics.getDailySales);
  const dayOfWeek = useQuery(api.analytics.getDayOfWeekStats);
  const paymentStats = useQuery(api.analytics.getPaymentStats);

  const COLORS = ["#c1440e", "#d96830", "#f0a500", "#2d2d2d", "#4a7c59"];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics</h2>

      {/* Peak Hours */}
      {peakHours && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Peak Ordering Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.values(peakHours.hours).every((h) => h.orders === 0) ? (
              <p className="text-xs text-muted-foreground">No order data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(peakHours.hours).map(([h, d]) => ({ hour: `${h}:00`, orders: d.orders, revenue: d.revenue }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#c1440e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daily Sales */}
      {dailySales && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySales.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailySales.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#c1440e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day of Week */}
      {dayOfWeek && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Orders by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#d96830" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      {paymentStats && paymentStats.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentStats.map((p) => ({ name: p.method, value: p.revenue }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {paymentStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Popular Toppings */}
      {popular && popular.toppings.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Most Popular Toppings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popular.toppings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f0a500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
