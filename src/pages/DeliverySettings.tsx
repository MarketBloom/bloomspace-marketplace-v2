import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DeliverySettingsForm } from "@/components/forms/DeliverySettingsForm";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeliverySettingsValues } from "@/types/delivery";
import { api } from "@/lib/api";

export default function DeliverySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["delivery-settings", user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/florists/${user?.id}/delivery-settings`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (values: DeliverySettingsValues) => {
      const response = await api.put(`/api/florists/${user?.id}/delivery-settings`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings", user?.id] });
    },
  });

  const handleSubmit = async (values: DeliverySettingsValues) => {
    await mutation.mutateAsync(values);
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold mb-6">Delivery Settings</h1>
            <DeliverySettingsForm
              onSubmit={handleSubmit}
              initialValues={settings}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}