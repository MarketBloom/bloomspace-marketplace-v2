import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { FloristProfile } from '@/types/florist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFloristProfile(id?: string) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch florist profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['floristProfile', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required');
      }

      console.log('Fetching profile for ID:', id);

      // First, check if a profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // If the error is 'not found', we should create a new profile
        if (fetchError.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          
          const newProfile = {
            user_id: id,
            store_name: '',
            store_status: 'pending',
            contact_email: '',
            contact_phone: '',
            about_text: '',
            website_url: null,
            address: {
              street_number: '',
              street_name: '',
              suburb: '',
              state: '',
              postcode: ''
            },
            business_settings: {
              delivery: {
                radius_km: 10,
                fee: 0,
                minimum_order: 0,
                same_day_cutoff: '14:00'
              },
              hours: {
                monday: { open: '09:00', close: '17:00' },
                tuesday: { open: '09:00', close: '17:00' },
                wednesday: { open: '09:00', close: '17:00' },
                thursday: { open: '09:00', close: '17:00' },
                friday: { open: '09:00', close: '17:00' },
                saturday: { open: '09:00', close: '17:00' },
                sunday: { open: '09:00', close: '17:00' }
              }
            }
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('florist_profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            throw new Error(createError.message);
          }

          return createdProfile as FloristProfile;
        }

        throw new Error(fetchError.message);
      }

      return existingProfile as FloristProfile;
    },
    enabled: !!id,
  });

  // Update florist profile using mutation
  const mutation = useMutation({
    mutationFn: async (updates: Partial<FloristProfile>) => {
      if (!id) {
        throw new Error('ID is required');
      }

      console.log('Updating profile with data:', updates);

      try {
        setLoading(true);

        // Transform address_details to address if it exists
        const { address_details, ...rest } = updates;
        const updateData = {
          ...rest,
          address: address_details,
          updated_at: new Date().toISOString()
        };

        console.log('Final update data:', updateData);

        // Update the profile
        const { data, error } = await supabase
          .from('florist_profiles')
          .upsert({
            ...updateData,
            user_id: id,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(error.message);
        }

        // Transform the response back to our frontend model
        const transformedData = {
          ...data,
          address_details: data.address
        };

        console.log('Update successful:', transformedData);
        return transformedData as FloristProfile;
      } catch (error) {
        console.error('Error in mutation:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['floristProfile', id] });
    }
  });

  const updateProfile = async (updates: Partial<FloristProfile>) => {
    try {
      return await mutation.mutateAsync(updates);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return {
    profile: profile ? { ...profile, address_details: profile.address } : undefined,
    isLoading: isLoading || loading,
    error,
    updateProfile
  };
}