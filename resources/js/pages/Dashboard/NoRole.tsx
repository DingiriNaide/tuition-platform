import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Presentation, Users } from 'lucide-react';

export default function NoRole() {
    return (
        <>
            <Head title="Get Started" />
            <div className="max-w-3xl mx-auto p-6 space-y-8 text-center py-12">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome to Ulama</h1>
                    <p className="text-gray-500 text-sm mt-1">Please select how you want to use the platform to get started.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { 
                            icon: GraduationCap, 
                            title: 'I am a Student', 
                            desc: 'Find tutors and join classes', 
                            href: '/profile/student/create',
                            iconColor: 'text-blue-600',
                            iconBg: 'bg-blue-50',
                            hoverClasses: 'hover:border-blue-200 hover:bg-blue-50/50'
                        },
                        { 
                            icon: Presentation, 
                            title: 'I am a Tutor',   
                            desc: 'Create courses and teach students', 
                            href: '/profile/tutor/create',
                            iconColor: 'text-emerald-600',
                            iconBg: 'bg-emerald-50',
                            hoverClasses: 'hover:border-emerald-200 hover:bg-emerald-50/50'
                        },
                        { 
                            icon: Users, 
                            title: 'I am a Parent',  
                            desc: "Monitor your child's progress", 
                            href: '/profile/parent/create',
                            iconColor: 'text-purple-600',
                            iconBg: 'bg-purple-50',
                            hoverClasses: 'hover:border-purple-200 hover:bg-purple-50/50'
                        },
                    ].map(({ icon: Icon, title, desc, href, iconColor, iconBg, hoverClasses }) => (
                        <Link
                            key={title}
                            href={href}
                            className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all text-center block group ${hoverClasses}`}
                        >
                            <div className={`size-14 mx-auto ${iconBg} rounded-full flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className={`size-7 ${iconColor}`} strokeWidth={1.5} />
                            </div>
                            <p className="font-semibold text-gray-900 text-base">{title}</p>
                            <p className="text-xs text-gray-500 mt-1">{desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}