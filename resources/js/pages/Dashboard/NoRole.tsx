import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function NoRole() {
    return (
        <AppLayout>
            <Head title="Get Started" />
            <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
                <h1 className="text-2xl font-semibold">Welcome to the Platform</h1>
                <p className="text-gray-500">Please select how you want to use the platform to get started.</p>

                <div className="grid grid-cols-3 gap-4">
                    
                    <Link
                        href="/profile/student/create"
                        className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition block"
                    >
                        <p className="text-2xl mb-2">🎓</p>
                        <p className="font-medium">I am a Student</p>
                        <p className="text-xs text-gray-500 mt-1">Find tutors and join classes</p>
                    </Link>
                    
                    <Link
                        href="/profile/tutor/create"
                        className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition block"
                    >
                        <p className="text-2xl mb-2">👨‍🏫</p>
                        <p className="font-medium">I am a Tutor</p>
                        <p className="text-xs text-gray-500 mt-1">Create courses and teach students</p>
                    </Link>
                    
                    <Link
                        href="/profile/parent/create"
                        className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition block"
                    >
                        <p className="text-2xl mb-2">👨‍👩‍👧</p>
                        <p className="font-medium">I am a Parent</p>
                        <p className="text-xs text-gray-500 mt-1">Monitor your child's progress</p>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}