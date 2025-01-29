import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { BusinessSettings } from "../../../../types/database";

interface BasicDeliverySettingsProps {
  formData: {
    delivery: BusinessSettings['delivery'];
  };
  onChange: (field: string, value: any) => void;
}

export function BasicDeliverySettings({ formData, onChange }: BasicDeliverySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Delivery Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Delivery Radius (km)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.delivery.radius_km}
            onChange={(e) => onChange('radius_km', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Base Delivery Fee ($)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.delivery.fee}
            onChange={(e) => onChange('fee', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Order ($)</Label>
          <Input
            type="number"
            min="0"
            max="1000"
            step="0.1"
            value={formData.delivery.minimum_order}
            onChange={(e) => onChange('minimum_order', parseFloat(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
}