import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const floristFormSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  address_details: z.object({
    street_number: z.string().min(1, 'Required'),
    street_name: z.string().min(1, 'Required'),
    suburb: z.string().min(1, 'Required'),
    state: z.string().min(2, 'Required'),
    postcode: z.string().length(4, 'Must be 4 digits')
  }),
  business_settings: z.object({
    delivery: z.object({
      radius_km: z.number().min(0),
      fee: z.number().min(0),
      minimum_order: z.number().min(0),
      same_day_cutoff: z.string(),
      next_day_cutoff_enabled: z.boolean()
    }),
    hours: z.record(z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean()
    }))
  }),
  about_text: z.string().optional(),
  social_links: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional()
})

type FloristFormValues = z.infer<typeof floristFormSchema>

interface FloristSetupFormProps {
  initialData?: Partial<FloristFormValues>
  onSubmit: (data: FloristFormValues) => void
  isLoading?: boolean
}

export function FloristSetupForm({ initialData, onSubmit, isLoading }: FloristSetupFormProps) {
  const form = useForm<FloristFormValues>({
    resolver: zodResolver(floristFormSchema),
    defaultValues: {
      storeName: initialData?.storeName || '',
      address_details: initialData?.address_details || {
        street_number: '',
        street_name: '',
        suburb: '',
        state: '',
        postcode: ''
      },
      business_settings: initialData?.business_settings || {
        delivery: {
          radius_km: 10,
          fee: 0,
          minimum_order: 0,
          same_day_cutoff: '14:00',
          next_day_cutoff_enabled: false
        },
        hours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: true }
        }
      },
      about_text: initialData?.about_text || '',
      social_links: initialData?.social_links || {}
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Details</h3>
          {Object.keys(form.getValues().address_details).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={`address_details.${key as keyof typeof form.getValues().address_details}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key.replace('_', ' ').toUpperCase()}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Details'}
        </Button>
      </form>
    </Form>
  )
} 