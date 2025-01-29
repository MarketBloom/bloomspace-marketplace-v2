import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const GiftCardList = () => {
  const { user } = useAuth();

  const { data: giftCards, isLoading } = useQuery({
    queryKey: ['gift-cards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .or(`purchaser_id.eq.${user.id},recipient_email.eq.${user.email}`);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!giftCards?.length) {
    return (
      <Card className="p-6 text-center text-gray-500">
        No gift cards found
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {giftCards.map((card) => (
        <Card key={card.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Gift Card Code: {card.code}</p>
              <p className="text-sm text-gray-600">
                {card.purchaser_id === user?.id ? 'Sent to: ' : 'Received from: '}
                {card.recipient_name}
              </p>
              {card.message && (
                <p className="text-sm text-gray-600 mt-2">
                  Message: {card.message}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                ${card.current_balance.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Initial: ${card.initial_balance.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};