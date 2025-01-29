import { z } from 'zod'
import type { ApplicationFormData } from '@/components/florist-application/FloristApplicationForm'

const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'] as const

const phoneRegex = /^(?:\+61|0)[2-478](?:[ -]?[0-9]){8}$/
const abnRegex = /^\d{11}$/

const enhancedAddressSchema = z.object({
  street_number: z.string().min(1, "Street number is required"),
  street_name: z.string().min(1, "Street name is required")
    .regex(/^[A-Za-z0-9\s'-]+$/, "Invalid street name format"),
  suburb: z.string().min(2, "Suburb is required")
    .regex(/^[A-Za-z\s'-]+$/, "Invalid suburb format"),
  state: z.enum(AUSTRALIAN_STATES, {
    errorMap: () => ({ message: "Must be a valid Australian state" })
  }),
  postcode: z.string().length(4, "Postcode must be 4 digits")
    .regex(/^\d+$/, "Postcode must be numeric")
}).refine((data) => {
  // Add state-postcode validation
  const postcodeRanges: Record<typeof AUSTRALIAN_STATES[number], [number, number]> = {
    NSW: [2000, 2999],
    VIC: [3000, 3999],
    QLD: [4000, 4999],
    WA: [6000, 6999],
    SA: [5000, 5999],
    TAS: [7000, 7999],
    NT: [0800, 0899],
    ACT: [2600, 2618]
  }
  const postcode = parseInt(data.postcode)
  const [min, max] = postcodeRanges[data.state]
  return postcode >= min && postcode <= max
}, "Postcode does not match state")

const enhancedBusinessCapabilitiesSchema = z.object({
  average_order_value: z.number()
    .min(30, "Average order value must be at least $30")
    .max(10000, "Please contact support for high-value orders"),
  weekly_capacity: z.number()
    .min(1, "Must be able to handle at least 1 order per week")
    .max(1000, "Please contact support for high volume capacity"),
  has_physical_store: z.boolean(),
  delivery_description: z.string()
    .min(50, "Please provide more detail about delivery capabilities")
    .max(500, "Description too long"),
  abn: z.string()
    .regex(abnRegex, "Invalid ABN format")
    .optional(),
  insurance_details: z.object({
    has_insurance: z.boolean(),
    policy_number: z.string().optional(),
    expiry_date: z.string().optional()
  }).refine((data) => {
    if (data.has_insurance) {
      return data.policy_number && data.expiry_date
    }
    return true
  }, "Insurance details required if has_insurance is true")
})

const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal(""))
}).refine((data) => {
  // Ensure at least one social link is provided
  return Object.values(data).some(link => link !== "")
}, "At least one social media link is recommended")

export const validateApplication = (data: ApplicationFormData) => {
  try {
    // Validate address
    enhancedAddressSchema.parse(data.address_details)
    
    // Validate business capabilities
    enhancedBusinessCapabilitiesSchema.parse(data.business_capabilities)
    
    // Validate social links if provided
    if (data.social_links) {
      socialLinksSchema.parse(data.social_links)
    }

    // Additional business logic validations
    if (data.years_experience < 1 && !data.has_physical_store) {
      throw new Error("New florists without a physical store require additional review")
    }

    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    }
    return {
      isValid: false,
      errors: [{ path: 'general', message: error.message }]
    }
  }
} 