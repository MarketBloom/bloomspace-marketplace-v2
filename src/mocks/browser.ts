import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Start the worker
if (import.meta.env.VITE_ENABLE_MOCK_API === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).catch(console.error);
} 