import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export function App() {
  return <RouterProvider router={router} />;
}

export { AddressAutocomplete } from './AddressAutocomplete';
export { AddressTest } from './AddressTest'; 