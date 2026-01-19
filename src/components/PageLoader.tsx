import { Skeleton } from "./ui/Skeleton";

export const PageLoader = () => {
    return (
        <div className="w-full h-full p-4 md:p-6 space-y-6 animate-pulse">
            {/* Top Bar / Filters Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-[180px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
