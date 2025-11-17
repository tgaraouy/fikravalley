import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for IdeaCard component
 * Mimics the layout with shimmer animation
 */
export function IdeaCardSkeleton() {
  return (
    <Card className="border-white/80 bg-white/95 animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="h-6 w-20 rounded-full bg-slate-200/50" />
          <div className="h-8 w-16 rounded bg-slate-200/50" />
        </div>
        <div className="h-6 w-3/4 rounded bg-slate-200/50" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full rounded bg-slate-200/50" />
          <div className="h-4 w-5/6 rounded bg-slate-200/50" />
          <div className="h-4 w-4/6 rounded bg-slate-200/50" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-6 w-16 rounded-full bg-slate-200/50" />
          <div className="h-4 w-20 rounded bg-slate-200/50" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for idea detail page
 * Mimics the full detail page layout
 */
export function IdeaDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 rounded-full bg-slate-200/50 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-slate-200/50 animate-pulse" />
        </div>
        <div className="h-10 w-3/4 rounded bg-slate-200/50 animate-pulse" />
        <div className="h-6 w-full rounded bg-slate-200/50 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-slate-200/50 animate-pulse" />
      </div>

      {/* AI Analysis Card Skeleton */}
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <div className="h-6 w-32 rounded bg-slate-200/50 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-32 rounded-xl bg-slate-200/50 animate-pulse" />
            <div className="h-32 rounded-xl bg-slate-200/50 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-24 rounded bg-slate-200/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-200/50 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-slate-200/50 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Architecture Card Skeleton */}
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <div className="h-6 w-48 rounded bg-slate-200/50 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-5 w-20 rounded bg-slate-200/50 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200/50 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-slate-200/50 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 w-20 rounded bg-slate-200/50 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200/50 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-slate-200/50 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-20 rounded-lg bg-slate-200/50 animate-pulse" />
            <div className="h-20 rounded-lg bg-slate-200/50 animate-pulse" />
            <div className="h-20 rounded-lg bg-slate-200/50 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* ROI Analysis Card Skeleton */}
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <div className="h-6 w-32 rounded bg-slate-200/50 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-16 rounded bg-slate-200/50 animate-pulse" />
            <div className="h-16 rounded bg-slate-200/50 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton for workshop dashboard
 * Mimics the dashboard layout with stats and cards
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-80 rounded bg-slate-700/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-slate-700/50 animate-pulse" />
            <div className="h-6 w-32 rounded bg-slate-700/50 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-0 bg-slate-800/50 animate-pulse">
            <CardContent className="p-8">
              <div className="h-6 w-24 rounded bg-slate-700/50 mb-3" />
              <div className="h-16 w-32 rounded bg-slate-700/50" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest Pending Idea Skeleton */}
      <div className="mb-8">
        <Card className="border-0 bg-amber-600/30 animate-pulse">
          <CardHeader>
            <div className="h-8 w-64 rounded bg-amber-500/50 mb-4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 w-32 rounded bg-amber-500/50" />
                <div className="h-8 w-full rounded bg-amber-500/50" />
                <div className="h-20 w-full rounded bg-amber-500/50" />
                <div className="h-16 w-full rounded bg-amber-500/50" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="h-6 w-40 rounded bg-amber-500/50 mb-4" />
                <div className="h-64 w-64 rounded-lg bg-amber-500/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validated Ideas List Skeleton */}
      <div className="mb-8">
        <Card className="border-0 bg-white/10 animate-pulse">
          <CardHeader>
            <div className="h-8 w-48 rounded bg-slate-700/50 mb-2" />
            <div className="h-5 w-64 rounded bg-slate-700/50" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 bg-emerald-500/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="h-16 w-16 rounded-full bg-emerald-600/50" />
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-3/4 rounded bg-emerald-600/50" />
                        <div className="h-4 w-1/2 rounded bg-emerald-600/50" />
                        <div className="h-4 w-full rounded bg-emerald-600/50" />
                      </div>
                      <div className="h-32 w-32 rounded-lg bg-emerald-600/50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Impact Skeleton */}
      <Card className="border-0 bg-indigo-600/30 animate-pulse">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-indigo-500/50" />
              <div className="h-12 w-48 rounded bg-indigo-500/50" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-indigo-500/50" />
              <div className="h-12 w-48 rounded bg-indigo-500/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

