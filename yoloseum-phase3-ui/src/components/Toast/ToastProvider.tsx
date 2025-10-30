import { toast } from '@/hooks/use-toast';

/**
 * Toast notification helper functions
 * Simplified API for common toast notifications
 */

/**
 * Show a success toast notification
 * @param title - Toast title
 * @param description - Toast description
 */
export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show an error toast notification
 * @param title - Toast title (default: "Error")
 * @param description - Toast description
 */
export function showErrorToast(title: string = 'Error', description?: string) {
  toast({
    title,
    description,
    variant: 'destructive',
  });
}

/**
 * Show a warning toast notification
 * @param title - Toast title
 * @param description - Toast description
 */
export function showWarningToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show an info toast notification
 * @param title - Toast title
 * @param description - Toast description
 */
export function showInfoToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show a toast with custom options
 * @param options - Toast options
 */
export function showToast(options: {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) {
  toast(options);
}

/**
 * Toast Provider Export
 * No wrapper needed - just import the helper functions above
 * The shadcn/ui toast system handles everything
 */
export const ToastProvider = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  custom: showToast,
};
