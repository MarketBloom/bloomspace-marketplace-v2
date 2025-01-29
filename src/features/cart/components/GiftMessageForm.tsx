import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface GiftMessageFormProps {
  isGift: boolean;
  recipientName: string;
  giftMessage: string;
  onIsGiftChange: (checked: boolean) => void;
  onRecipientNameChange: (name: string) => void;
  onGiftMessageChange: (message: string) => void;
}

export const GiftMessageForm = ({
  isGift,
  recipientName,
  giftMessage,
  onIsGiftChange,
  onRecipientNameChange,
  onGiftMessageChange,
}: GiftMessageFormProps) => {
  return (
    <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="is-gift" className="font-medium">
          Is this a gift?
        </Label>
        <Switch
          id="is-gift"
          checked={isGift}
          onCheckedChange={onIsGiftChange}
        />
      </div>

      {isGift && (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient's Name</Label>
            <Input
              id="recipient-name"
              placeholder="Enter recipient's name"
              value={recipientName}
              onChange={(e) => onRecipientNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-message">Gift Message</Label>
            <Textarea
              id="gift-message"
              placeholder="Enter your gift message"
              value={giftMessage}
              onChange={(e) => onGiftMessageChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};