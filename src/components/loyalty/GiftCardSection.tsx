import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftCardPurchaseForm } from "./GiftCardPurchaseForm";
import { GiftCardList } from "./GiftCardList";

export const GiftCardSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Gift Cards</h2>
      
      <Tabs defaultValue="my-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-cards">My Gift Cards</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Gift Card</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-cards" className="mt-4">
          <GiftCardList />
        </TabsContent>
        
        <TabsContent value="purchase" className="mt-4">
          <GiftCardPurchaseForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};