import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  ChefHat,
  Clock,
  Award,
  ArrowRight,
  Pizza,
  Leaf,
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router";

const featuredPizzas = [
  {
    name: "Margherita",
    desc: "Classic tomato, mozzarella, fresh basil",
    price: 299,
    tag: "Bestseller",
  },
  {
    name: "Pepperoni Supreme",
    desc: "Loaded with pepperoni and melted cheese",
    price: 399,
    tag: "Popular",
  },
  {
    name: "BBQ Chicken",
    desc: "Smoky BBQ with grilled chicken",
    price: 429,
    tag: "Chef's Pick",
  },
  {
    name: "Paneer Tikka",
    desc: "Spicy paneer tikka on wood-fired crust",
    price: 379,
    tag: "Spicy",
  },
];

const features = [
  {
    icon: Flame,
    title: "Wood-Fired Oven",
    desc: "Authentic taste from our traditional wood-fired oven at 450°C",
  },
  {
    icon: Pizza,
    title: "Build Your Own",
    desc: "Choose your base, sauce, cheese, and toppings for the perfect pizza",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    desc: "Locally sourced, fresh ingredients prepared daily",
  },
  {
    icon: ChefHat,
    title: "Expert Craftsmanship",
    desc: "Our pizzaiolos bring years of artisan pizza-making experience",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-20">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <Flame className="h-8 w-8 text-primary animate-flame" />
              <span className="text-xl font-bold tracking-tight">
                Make Your Own Pizza
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
                🔥 Wood-Fired • Artisan • Fresh
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Craft Your
                <span className="text-primary block">Perfect Pizza</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                Choose your base, sauce, cheese, and toppings. Watch as our
                artisans wood-fire your custom creation to perfection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 fire-gradient text-white shadow-lg hover:shadow-xl transition-all">
                  Build Your Pizza
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-base px-8">
                  View Menu
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-golden fill-golden" />
                <span>4.8 Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                <span>5000+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>Ready in 12 min</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Signature Creations
            </h2>
            <p className="text-muted-foreground text-lg">
              Our most loved wood-fired masterpieces
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPizzas.map((pizza, i) => (
              <motion.div
                key={pizza.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border-border/50">
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                      🍕
                    </span>
                    <Badge className="absolute top-3 right-3 text-xs" variant="secondary">
                      {pizza.tag}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-1">{pizza.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {pizza.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-lg">
                        ₹{pizza.price}
                      </span>
                      <Link to="/auth">
                        <Button size="sm" variant="outline">
                          Order
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-lg">
              The art of pizza-making, perfected
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-6 h-full border-border/50 hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make Your Pizza?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Scan the QR code at your table to start building your perfect
              wood-fired pizza.
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-base px-10 fire-gradient text-white shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Make Your Own Pizza</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Artisan wood-fired pizzas made with love and the finest
              ingredients.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Visit Us</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Pizza Lane, Food Street</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>11 AM - 11 PM, All Days</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/auth" className="block hover:text-primary transition-colors">
                Order Now
              </Link>
              <Link to="/hall-of-fame" className="block hover:text-primary transition-colors">
                Pizza Hall of Fame
              </Link>
              <Link to="/auth" className="block hover:text-primary transition-colors">
                Loyalty Rewards
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-8">
          © 2026 Make Your Own Pizza. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
