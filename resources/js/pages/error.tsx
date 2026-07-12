import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard } from '@/routes';

interface Props {
    status: number;
}

const errors: Record<number, { title: string; description: string }> = {
    404: {
        title: 'Page Not Found',
        description: "Sorry, the page you're looking for doesn't exist or has been moved.",
    },
    403: {
        title: 'Access Forbidden',
        description: "You don't have permission to access this page.",
    },
    500: {
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
    },
    503: {
        title: 'Service Unavailable',
        description: 'Ulama is temporarily down for maintenance. Please check back soon.',
    },
};

export default function Error({ status }: Props) {
    const { title, description } = errors[status] ?? {
        title: 'Unexpected Error',
        description: 'An unexpected error occurred.',
    };

    return (
        <>
            <Head title={`${status} — ${title}`} />
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800
                            flex flex-col items-center justify-center px-6 text-center">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-12">
                    <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center p-0">
                        <AppLogoIcon className="w-full h-full text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">Ulama</span>
                </div>

                {/* Error code */}
                <div className="mb-6">
                    <span className="text-8xl font-black text-emerald-700 select-none">{status}</span>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
                <p className="text-emerald-300 text-base max-w-md mb-10">{description}</p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={dashboard()}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold
                                px-8 py-3 rounded-xl transition-colors"
                    >
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-white/10 hover:bg-white/20 text-white font-semibold
                                   px-8 py-3 rounded-xl transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </>
    );
}

// No layout for error pages
Error.layout = () => null;