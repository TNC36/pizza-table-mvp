import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Trophy } from "lucide-react";
import { useNavigate } from "react-router";

export default function HallOfFamePage() {
  const navigate = useNavigate();
  const winners = useQuery(api.hallOfFame.getPublishedWinners);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-bold">Pizza Hall of Fame</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trophy className="h-16 w-16 text-golden mx-auto mb-3" />
            <h1 className="text-3xl font-bold mb-2">🏆 Hall of Fame</h1>
            <p className="text-muted-foreground">
              Our most frequent pizza lovers!
            </p>
          </motion.div>
        </div>

        {winners === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : winners.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <span className="text-4xl block mb-3">🍕</span>
              <p className="text-muted-foreground">
                No winners yet. Keep visiting to earn your spot!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Top 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {winners.slice(0, 3).map((winner, i) => (
                <motion.div
                  key={winner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`border-border/50 text-center ${
                      i === 0 ? "ring-2 ring-golden" : ""
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="text-3xl mb-2">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </div>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-bold text-primary">
                          {winner.displayName.charAt(0)}
                        </span>
                      </div>
                      <p className="font-bold">{winner.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {winner.visitCount} visits
                      </p>
                      <Badge className="mt-2 text-xs" variant="secondary">
                        {winner.prizeTitle}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {winner.month}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Rest */}
            {winners.length > 3 && (
              <div className="space-y-2">
                {winners.slice(3).map((winner, i) => (
                  <motion.div
                    key={winner._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <Card className="border-border/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-muted-foreground w-6">
                            {i + 4}.
                          </span>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {winner.displayName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {winner.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {winner.visitCount} visits • {winner.month}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {winner.prizeTitle}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
