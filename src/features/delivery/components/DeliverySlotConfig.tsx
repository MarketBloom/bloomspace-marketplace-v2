import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import type { DeliverySlots, DeliverySlot } from "@/types/florist";

interface DeliverySlotConfigProps {
  value: DeliverySlots;
  onChange: (slots: DeliverySlots) => void;
}

export const DeliverySlotConfig = ({ value, onChange }: DeliverySlotConfigProps) => {
  const [activeTab, setActiveTab] = useState<'weekdays' | 'weekends'>('weekdays');

  const handleSlotChange = (dayType: 'weekdays' | 'weekends', index: number, changes: Partial<DeliverySlot>) => {
    const newValue = { ...value };
    newValue[dayType].slots[index] = {
      ...newValue[dayType].slots[index],
      ...changes,
    };
    onChange(newValue);
  };

  const addSlot = (dayType: 'weekdays' | 'weekends') => {
    const newValue = { ...value };
    const newSlot: DeliverySlot = {
      name: `Slot ${newValue[dayType].slots.length + 1}`,
      start: "09:00",
      end: "17:00",
      enabled: true,
    };
    newValue[dayType].slots = [...newValue[dayType].slots, newSlot];
    onChange(newValue);
  };

  const removeSlot = (dayType: 'weekdays' | 'weekends', index: number) => {
    const newValue = { ...value };
    newValue[dayType].slots = newValue[dayType].slots.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const renderSlots = (dayType: 'weekdays' | 'weekends') => {
    const slots = value[dayType].slots;

    return (
      <div className="space-y-4">
        {slots.map((slot, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slot Name</Label>
                <Input
                  value={slot.name}
                  onChange={(e) => handleSlotChange(dayType, index, { name: e.target.value })}
                  placeholder="e.g., Morning"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-4">
                <Label className="text-sm">Enabled</Label>
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) => handleSlotChange(dayType, index, { enabled: checked })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlot(dayType, index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={slot.start}
                  onChange={(e) => handleSlotChange(dayType, index, { start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={slot.end}
                  onChange={(e) => handleSlotChange(dayType, index, { end: e.target.value })}
                />
              </div>
            </div>
          </Card>
        ))}

        {slots.length < 3 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => addSlot(dayType)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Delivery Slot
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'weekdays' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('weekdays')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === 'weekdays' ? 'active' : 'inactive'}
        >
          Weekdays
        </Button>
        <Button
          variant={activeTab === 'weekends' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('weekends')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          data-state={activeTab === 'weekends' ? 'active' : 'inactive'}
        >
          Weekends
        </Button>
      </div>

      {renderSlots(activeTab)}
    </div>
  );
};
