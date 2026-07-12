import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="top-right"
            richColors
            closeButton
            style={
                {
                    '--normal-bg': '#ffffff',
                    '--normal-text': '#0f172a',
                    '--normal-border': '#e2e8f0',
                    '--success-bg': '#f0fdf4',
                    '--success-text': '#166534',
                    '--success-border': '#bbf7d0',
                    '--error-bg': '#fef2f2',
                    '--error-text': '#991b1b',
                    '--error-border': '#fecaca',
                    '--warning-bg': '#fffbeb',
                    '--warning-text': '#92400e',
                    '--warning-border': '#fde68a',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
