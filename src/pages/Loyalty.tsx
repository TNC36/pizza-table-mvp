import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Gift, Star, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function LoyaltyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const userPoints = useQuery(
    api.loyalty.getUserPoints,
    user?._id ? { userId: user._id } : "skip",
  );
  const transactions = useQuery(
    api.loyalty.getUserTransactions,
    user?._id ? { userId: user._id } : "skip",
  );
  const rewards = useQuery(api.loyalty.getRewards);
  const redeemReward = useMutation(api.loyalty.redeemReward);

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      await redeemReward({ rewardId: rewardId as unknown as Id<"loyaltyRewards"> });
      toast.success("Reward redeemed!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to redeem");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold">Loyalty Rewards</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Points Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-primary/20">
            <div className="fire-gradient p-8 text-white text-center">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-80" />
              <p className="text-white/70 text-sm">Your Points Balance</p>
              <p className="text-5xl font-bold mt-1">{userPoints?.pointsBalance ?? 0}</p>
              <p className="text-white/70 text-sm mt-2">{userPoints?.visitCount ?? 0} total visits • ₹{userPoints?.totalSpent ?? 0} spent</p>
            </div>
          </Card>
        </motion.div>

        {/* Available Rewards */}
        {rewards && rewards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold mb-3">Available Rewards</h2>
            <div className="space-y-3">
              {rewards.map((reward) => {
                const canRedeem = (userPoints?.pointsBalance ?? 0) >= reward.pointsRequired;
                return (
                  <Card key={reward._id} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{reward.title}</p>
                          <p className="text-xs text-muted-foreground">{reward.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={canRedeem ? "default" : "secondary"} className="mb-1">
                          {reward.pointsRequired} pts
                        </Badge>
                        <Button
                          size="sm"
                          disabled={!canRedeem || redeeming === reward._id}
                          onClick={() => handleRedeem(reward._id)}
                          className="block w-full"
                        >
                          {redeeming === reward._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : canRedeem ? (
                            "Redeem"
                          ) : (
                            "Not enough"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Transactions */}
        {transactions && transactions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-bold mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <Card key={tx._id} className="border-border/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "earned" ? "bg-green-100" : "bg-red-100"}`}>
                        {tx.type === "earned" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Gift className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "earned" ? "+" : "-"}{tx.points}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
