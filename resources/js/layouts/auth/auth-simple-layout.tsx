import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                {/* Background image */}
                <img
                    src="/images/auth-illustration.jpeg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-left"
                />
                {/* Gradient overlay for text legibility + brand tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/70 to-emerald-950/80" />
                <div className="absolute inset-0 bg-emerald-900/20" />

                {/* Content sits above the image/overlay */}
                <div className="relative flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                        <AppLogoIcon className="w-full h-full text-white" />
                    </div>
                    <span className="text-white font-bold text-xl">Ulama</span>
                </div>

                <div className="relative">
                    <h2 className="text-4xl font-bold text-white leading-snug mb-4">
                        Sri Lanka's Premier<br />Online Tutoring Platform
                    </h2>
                    <p className="text-emerald-200 text-base leading-relaxed max-w-md">
                        Connect with qualified tutors for O/L, A/L, and foundation courses.
                        Learn in Sinhala, Tamil, or English — at your own pace.
                    </p>

                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Tutors', value: '50+' },
                            { label: 'Courses', value: '100+' },
                            { label: 'Students', value: '500+' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-emerald-300 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-emerald-400 text-sm">
                    © {new Date().getFullYear()} Ulama. All rights reserved.
                </p>
            </div>

            {/* Right panel — form (unchanged) */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
                <div className="lg:hidden flex items-center gap-3 mb-8">
                    <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                        <AppLogoIcon className="w-full h-full text-white" />
                    </div>
                    <span className="font-bold text-xl text-foreground">Ulama</span>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground mt-2">{description}</p>
                    </div>

                    {children}
                </div>

                <p className="mt-8 text-xs text-muted-foreground lg:hidden">
                    © {new Date().getFullYear()} Ulama. All rights reserved.
                </p>
            </div>
        </div>
    );
}