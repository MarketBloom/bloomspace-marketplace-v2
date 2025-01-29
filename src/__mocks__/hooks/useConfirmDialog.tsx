import { vi } from 'vitest';

export const mockConfirm = vi.fn().mockResolvedValue(true);

const useConfirmDialog = () => {
  return {
    confirm: mockConfirm,
  };
};

export default useConfirmDialog;
