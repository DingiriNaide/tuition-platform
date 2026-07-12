import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

interface Props {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-16 rounded-2xl bg-emerald-50 border border-emerald-100
                            flex items-center justify-center mb-4">
                <Icon className="size-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {action && (
                <Link
                    href={action.href}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
                               px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}