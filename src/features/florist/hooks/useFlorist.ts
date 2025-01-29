import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  validateAddress,
  validateBusinessSettings,
  validateFloristProfile,
} from '@/utils/validation';
import { formatAddress, parseHereAddress } from '@/utils/geo';
import type {
  Address,
  BusinessSettings,
  FloristProfile,
  FloristProfileFormData,
  AddressWithCoordinates,
} from '@/types/schema';

interface Florist {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  address: AddressWithCoordinates;
  delivery_radius: number;
  minimum_order: number;
  delivery_fee: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

interface UpdateFloristInput {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: AddressWithCoordinates;
  delivery_radius?: number;
  minimum_order?: number;
  delivery_fee?: number;
  status?: 'active' | 'inactive' | 'pending';
}

export function useFlorist(floristId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: florist, isLoading, error } = useQuery({
    queryKey: ['florist', floristId],
    queryFn: async () => {
      if (!floristId) return null;

      const { data, error } = await supabase
        .from('florists')
        .select('*')
        .eq('id', floristId)
        .single();

      if (error) throw error;
      return data as Florist;
    },
    enabled: !!floristId,
  });

  const updateFlorist = useMutation({
    mutationFn: async (input: UpdateFloristInput) => {
      if (!floristId) throw new Error('Florist ID is required');

      const { data, error } = await supabase
        .from('florists')
        .update(input)
        .eq('id', floristId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['florist', floristId] });
      toast({
        title: 'Success',
        description: 'Florist details updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating florist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update florist details. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateFlorist = useCallback(
    async (input: UpdateFloristInput) => {
      await updateFlorist.mutateAsync(input);
    },
    [updateFlorist]
  );

  return {
    florist,
    isLoading,
    error,
    updateFlorist: handleUpdateFlorist,
    isUpdating: updateFlorist.isPending,
  };
}
