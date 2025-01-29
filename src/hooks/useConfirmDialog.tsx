import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions>({});

  const confirm = useCallback(
    async (message: string, opts: ConfirmOptions = {}) => {
      return new Promise<boolean>((resolve) => {
        setOptions({
          title: opts.title || 'Confirm Action',
          description: message,
          confirmLabel: opts.confirmLabel,
          cancelLabel: opts.cancelLabel,
        });
        setResolveRef(() => resolve);
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setIsOpen(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
      setIsOpen(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const Dialog = useCallback(
    () => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={options.title || 'Confirm Action'}
        description={options.description}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [isOpen, options, handleConfirm, handleCancel]
  );

  return {
    confirm,
    Dialog,
  };
}

export default useConfirmDialog;
