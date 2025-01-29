import { vi } from 'vitest';

export const mockConfirm = vi.fn().mockResolvedValue(true);

export const useConfirmDialog = () => {
  return {
    confirm: mockConfirm,
  };
}

// Make sure we export as default as well since the original module likely uses default export
export default useConfirmDialog;
