import { useState, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingCart,
  Flame,
  X,
  Leaf,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";

type Step = "base" | "sauce" | "cheese" | "toppings" | "preview";

const STEPS: { key: Step; label: string; emoji: string }[] = [
  { key: "base", label: "Base", emoji: "🫓" },
  { key: "sauce", label: "Sauce", emoji: "🍅" },
  { key: "cheese", label: "Cheese", emoji: "🧀" },
  { key: "toppings", label: "Toppings", emoji: "🍄" },
  { key: "preview", label: "Preview", emoji: "🍕" },
];

export default function PizzaBuilder() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [step, setStep] = useState<Step>("base");
  const [selectedBase, setSelectedBase] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [selectedCheese, setSelectedCheese] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<
    { name: string; price: number }[]
  >([]);

  const bases = useQuery(api.pizzaBuilder.getBases);
  const sauces = useQuery(api.pizzaBuilder.getSauces);
  const cheeses = useQuery(api.pizzaBuilder.getCheeses);
  const toppings = useQuery(api.pizzaBuilder.getToppings);

  const total = useMemo(() => {
    const baseP = selectedBase?.price ?? 0;
    const sauceP = selectedSauce?.price ?? 0;
    const cheeseP = selectedCheese?.price ?? 0;
    const toppingsP = selectedToppings.reduce((s, t) => s + t.price, 0);
    return baseP + sauceP + cheeseP + toppingsP;
  }, [selectedBase, selectedSauce, selectedCheese, selectedToppings]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const toggleTopping = (topping: { name: string; price: number }) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.name === topping.name);
      if (exists) return prev.filter((t) => t.name !== topping.name);
      return [...prev, topping];
    });
  };

  const addPizzaToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;
    addItem({
      type: "custom_pizza",
      name: "Custom Wood-Fired Pizza",
      quantity: 1,
      price: total,
      customPizzaData: {
        base: selectedBase.name,
        basePrice: selectedBase.price,
        sauce: selectedSauce.name,
        saucePrice: selectedSauce.price,
        cheese: selectedCheese.name,
        cheesePrice: selectedCheese.price,
        toppings: selectedToppings,
      },
    });
    navigate(`/cart${tableId ? `?tableId=${tableId}` : ""}`);
  };

  const canProceed = () => {
    if (step === "base") return selectedBase !== null;
    if (step === "sauce") return selectedSauce !== null;
    if (step === "cheese") return selectedCheese !== null;
    if (step === "toppings") return true;
    return false;
  };

  const goNext = () => {
    if (!canProceed()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex].key);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(STEPS[prevIndex].key);
  };

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
              <span className="font-bold">Build Pizza</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/cart${tableId ? `?tableId=${tableId}` : ""}`} className="relative">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (i < currentStepIndex) setStep(s.key);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  s.key === step
                    ? "text-primary"
                    : i < currentStepIndex
                      ? "text-primary/60"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    s.key === step
                      ? "bg-primary text-white"
                      : i < currentStepIndex
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStepIndex ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    s.emoji
                  )}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < currentStepIndex ? "bg-primary/30" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4">
        <AnimatePresence mode="wait">
          {/* Step: Base */}
          {step === "base" && (
            <motion.div
              key="base"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-1">Choose Your Base</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The foundation of your perfect pizza
              </p>
              {bases === undefined ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  {bases.map((base) => (
                    <button
                      key={base._id}
                      onClick={() =>
                        setSelectedBase({ name: base.name, price: base.price })
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedBase?.name === base.name
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{base.name}</p>
                          {base.description && (
                            <p className="text-xs text-muted-foreground">
                              {base.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {base.price === 0 ? (
                            <Badge variant="secondary">Included</Badge>
                          ) : (
                            <span className="font-bold text-primary">
                              +₹{base.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Sauce */}
          {step === "sauce" && (
            <motion.div
              key="sauce"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-1">Choose Your Sauce</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The flavor that brings it all together
              </p>
              {sauces === undefined ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  {sauces.map((sauce) => (
                    <button
                      key={sauce._id}
                      onClick={() =>
                        setSelectedSauce({ name: sauce.name, price: sauce.price })
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedSauce?.name === sauce.name
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{sauce.name}</p>
                          {sauce.description && (
                            <p className="text-xs text-muted-foreground">
                              {sauce.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {sauce.price === 0 ? (
                            <Badge variant="secondary">Included</Badge>
                          ) : (
                            <span className="font-bold text-primary">
                              +₹{sauce.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Cheese */}
          {step === "cheese" && (
            <motion.div
              key="cheese"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-1">Choose Your Cheese</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The melty goodness that makes it irresistible
              </p>
              {cheeses === undefined ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  {cheeses.map((cheese) => (
                    <button
                      key={cheese._id}
                      onClick={() =>
                        setSelectedCheese({
                          name: cheese.name,
                          price: cheese.price,
                        })
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedCheese?.name === cheese.name
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{cheese.name}</p>
                          {cheese.description && (
                            <p className="text-xs text-muted-foreground">
                              {cheese.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {cheese.price === 0 ? (
                            <Badge variant="secondary">Included</Badge>
                          ) : (
                            <span className="font-bold text-primary">
                              +₹{cheese.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Toppings */}
          {step === "toppings" && (
            <motion.div
              key="toppings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-1">Add Your Toppings</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select your favorites (all optional!)
              </p>
              {toppings === undefined ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {selectedToppings.length > 0 && (
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Selected:</span>
                      {selectedToppings.map((t) => (
                        <Badge
                          key={t.name}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/10"
                          onClick={() => toggleTopping(t)}
                        >
                          {t.name} +₹{t.price}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {toppings.map((topping) => {
                      const isSelected = selectedToppings.some(
                        (t) => t.name === topping.name,
                      );
                      const isOutOfStock =
                        !topping.available || topping.stockQuantity <= 0;
                      return (
                        <button
                          key={topping._id}
                          onClick={() =>
                            !isOutOfStock &&
                            toggleTopping({
                              name: topping.name,
                              price: topping.price,
                            })
                          }
                          disabled={isOutOfStock}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            isOutOfStock
                              ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm">{topping.name}</p>
                              {isOutOfStock ? (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Out of Stock
                                </Badge>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  +₹{topping.price}
                                </p>
                              )}
                              {topping.category && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] mt-1"
                                >
                                  {topping.category === "veg" ? (
                                    <Leaf className="h-2.5 w-2.5 mr-0.5 text-green-600" />
                                  ) : null}
                                  {topping.category}
                                </Badge>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-4">Your Pizza</h2>
              {/* Pizza Visual */}
              <Card className="overflow-hidden mb-6">
                <div className="bg-gradient-to-br from-golden/20 via-primary/10 to-primary/5 p-8 text-center">
                  <motion.div
                    className="text-8xl mb-4"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    🍕
                  </motion.div>
                  <h3 className="font-bold text-lg mb-1">Custom Wood-Fired Pizza</h3>
                  <p className="text-sm text-muted-foreground">
                    Made with love in our wood-fired oven
                  </p>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base</span>
                    <span className="font-medium">{selectedBase?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sauce</span>
                    <span className="font-medium">{selectedSauce?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cheese</span>
                    <span className="font-medium">{selectedCheese?.name}</span>
                  </div>
                  {selectedToppings.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Toppings</span>
                      <div className="text-right">
                        {selectedToppings.map((t) => (
                          <p key={t.name} className="font-medium text-sm">
                            {t.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3 space-y-1">
                    {selectedBase && selectedBase.price > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{selectedBase.name}</span>
                        <span>₹{selectedBase.price}</span>
                      </div>
                    )}
                    {selectedSauce && selectedSauce.price > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{selectedSauce.name}</span>
                        <span>₹{selectedSauce.price}</span>
                      </div>
                    )}
                    {selectedCheese && selectedCheese.price > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{selectedCheese.name}</span>
                        <span>₹{selectedCheese.price}</span>
                      </div>
                    )}
                    {selectedToppings.map((t) => (
                      <div key={t.name} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.name}</span>
                        <span>₹{t.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-xl text-primary">₹{total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={addPizzaToCart}
                className="w-full fire-gradient text-white shadow-lg h-12 text-base"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart — ₹{total}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {step !== "preview" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4">
          <div className="mx-auto max-w-4xl flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {/* Live Price */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Current Total</p>
              <p className="font-bold text-lg text-primary">₹{total}</p>
            </div>

            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="fire-gradient text-white"
            >
              {step === "toppings" ? "Review" : "Next"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
