export default function StatsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-${count > 4 ? 4 : count} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="size-8 rounded-lg bg-gray-200"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
                </div>
            ))}
        </div>
    );
}