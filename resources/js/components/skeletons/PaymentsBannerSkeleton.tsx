export default function PaymentsBannerSkeleton() {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 flex items-center justify-between">
            <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded-xl animate-pulse" />
        </div>
    );
}