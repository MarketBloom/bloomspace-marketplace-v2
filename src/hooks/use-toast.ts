import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastFunction = {
  (props: ToastProps): void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  default: (title: string, description?: string) => void;
}

type ToastReturn = {
  toast: ToastFunction;
}

export function useToast(): ToastReturn {
  const toast = (({
    title,
    description,
    variant = "default",
    duration = 5000,
    action,
  }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title, { description, duration, action });
    } else if (variant === "success") {
      sonnerToast.success(title, { description, duration, action });
    } else {
      sonnerToast(title, { description, duration, action });
    }
  }) as ToastFunction;

  toast.success = (title: string, description?: string) =>
    sonnerToast.success(title, { description });
  toast.error = (title: string, description?: string) =>
    sonnerToast.error(title, { description });
  toast.default = (title: string, description?: string) =>
    sonnerToast(title, { description });

  return { toast };
}

// For direct usage without the hook
export const toast = {
  success: (title: string, description?: string) =>
    sonnerToast.success(title, { description }),
  error: (title: string, description?: string) =>
    sonnerToast.error(title, { description }),
  default: (title: string, description?: string) =>
    sonnerToast(title, { description }),
} 