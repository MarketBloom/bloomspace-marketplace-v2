import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AddressAutocomplete } from '../../../components/address/AddressAutocomplete';
import { AddressWithCoordinates } from '../../../types/address';

interface FloristSignupFormData {
  businessName: string;
  email: string;
  phone: string;
  address: AddressWithCoordinates;
  deliveryRadius: number;
  description: string;
}

export const FloristSignupForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FloristSignupFormData>();

  const onSubmit = async (data: FloristSignupFormData) => {
    console.log('Form data:', data);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
          Business Name
        </label>
        <Controller
          name="businessName"
          control={control}
          rules={{ required: 'Business name is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <Controller
          name="phone"
          control={control}
          rules={{ required: 'Phone number is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="tel"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Business Address
        </label>
        <Controller
          name="address"
          control={control}
          rules={{ required: 'Business address is required' }}
          render={({ field: { onChange } }) => (
            <AddressAutocomplete
              onAddressSelect={onChange}
              placeholder="Enter your business address"
              className="mt-1"
            />
          )}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="deliveryRadius" className="block text-sm font-medium text-gray-700">
          Delivery Radius (km)
        </label>
        <Controller
          name="deliveryRadius"
          control={control}
          rules={{
            required: 'Delivery radius is required',
            min: { value: 1, message: 'Minimum delivery radius is 1km' },
            max: { value: 100, message: 'Maximum delivery radius is 100km' },
          }}
          render={({ field: { onChange, value } }) => (
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="100"
                value={value || 10}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-12">{value || 10}km</span>
            </div>
          )}
        />
        {errors.deliveryRadius && (
          <p className="mt-1 text-sm text-red-600">{errors.deliveryRadius.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Business Description
        </label>
        <Controller
          name="description"
          control={control}
          rules={{ required: 'Business description is required' }}
          render={({ field }) => (
            <textarea
              {...field}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
}; 