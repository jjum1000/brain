import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton loader for dashboard stat cards
 * Shows placeholder while data is loading
 */
export function StatsSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-24 bg-slate-700" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 bg-slate-700" />
          <Skeleton className="h-3 w-24 bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for card grid (stats cards)
 * Shows multiple card placeholders
 */
export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <StatsSkeleton key={i} />
        ))}
    </div>
  );
}

/**
 * Skeleton loader for table section
 * Shows header + multiple skeleton rows
 */
export function TableSkeleton({ rowCount = 5 }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-slate-700 mb-4" />
        <Skeleton className="h-4 w-60 bg-slate-700" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20 bg-slate-700" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(rowCount)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-slate-700">
                    <td className="p-4">
                      <Skeleton className="h-4 w-16 bg-slate-700" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-20 bg-slate-700" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-24 bg-slate-700" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-20 bg-slate-700" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-16 bg-slate-700" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for card list
 * Shows vertical list of cards
 */
export function CardListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-4 w-5/6 bg-slate-700" />
                <Skeleton className="h-4 w-4/6 bg-slate-700" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

/**
 * Skeleton loader for profile section
 */
export function ProfileSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full bg-slate-700" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40 bg-slate-700" />
            <Skeleton className="h-4 w-60 bg-slate-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-5/6 bg-slate-700" />
          <Skeleton className="h-4 w-4/6 bg-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for trader/strategy card grid
 */
export function TraderCardSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 bg-slate-700" />
            <Skeleton className="h-4 w-24 bg-slate-700" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-slate-700" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-4 w-24 bg-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton grid for trader/strategy cards
 */
export function TraderGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <TraderCardSkeleton key={i} />
        ))}
    </div>
  );
}
