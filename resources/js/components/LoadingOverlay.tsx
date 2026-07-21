import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface Props {
    show: boolean;
    message?: string;
    variant?: 'fullscreen' | 'card';
}

export default function LoadingOverlay({ show, message, variant = 'fullscreen' }: Props) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={
                        variant === 'fullscreen'
                            ? 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center'
                            : 'absolute inset-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center rounded-2xl'
                    }
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 shadow-xl"
                    >
                        <Loader2 className="size-8 text-emerald-600 animate-spin" />
                        {message && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}