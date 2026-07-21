export default function EarningsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-7 w-36 bg-gray-200 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}