import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GiftCardPurchaseForm = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Generate a unique code (simple implementation - in production use a more secure method)
      const code = Math.random().toString(36).substring(2, 15);
      
      // Set expiry date to 1 year from now and format as ISO string
      const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('gift_cards')
        .insert({
          code,
          initial_balance: Number(amount),
          current_balance: Number(amount),
          purchaser_id: user.id,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          message,
          expires_at: expiryDate,
        });

      if (error) throw error;

      toast.success("Gift card purchased successfully!");
      // Reset form
      setAmount("");
      setRecipientEmail("");
      setRecipientName("");
      setMessage("");
    } catch (error) {
      console.error('Error purchasing gift card:', error);
      toast.error("Failed to purchase gift card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          min="10"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      
      <div>
        <Label htmlFor="recipientEmail">Recipient Email</Label>
        <Input
          id="recipientEmail"
          type="email"
          required
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Enter recipient's email"
        />
      </div>

      <div>
        <Label htmlFor="recipientName">Recipient Name</Label>
        <Input
          id="recipientName"
          required
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Enter recipient's name"
        />
      </div>

      <div>
        <Label htmlFor="message">Gift Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a personal message"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Purchase Gift Card"}
      </Button>
    </form>
  );
};