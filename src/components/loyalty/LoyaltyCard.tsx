import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Coins, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const LoyaltyCard = () => {
  const { user } = useAuth();

  const { data: loyaltyPoints, isLoading } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("customer_id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getPointsLevel = (points: number) => {
    if (points >= 1000) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Loyalty Program</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading loyalty points...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {loyaltyPoints?.points_balance || 0}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {getPointsLevel(loyaltyPoints?.points_balance || 0)} Level
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Points Earned: {loyaltyPoints?.total_points_earned || 0}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};