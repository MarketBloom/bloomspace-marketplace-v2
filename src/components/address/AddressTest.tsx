import { useState } from 'react'
import { AddressAutocomplete } from './AddressAutocomplete'
import { Button } from '@/components/ui/button'
import type { AddressWithCoordinates } from '../../types/address'

export function AddressTest() {
  const [selectedAddress, setSelectedAddress] = useState<AddressWithCoordinates | null>(null)

  const handleAddressSelect = (address: AddressWithCoordinates) => {
    console.log('Selected address:', address)
    setSelectedAddress(address)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Address Autocomplete Test</h2>
      
      <div className="w-full max-w-md">
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          placeholder="Enter an address to test..."
        />
      </div>

      {selectedAddress && (
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="font-medium mb-2">Selected Address Details:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(selectedAddress, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 