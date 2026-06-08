import type { ReactNode } from "react";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-xl bg-black/10 ${className}`.trim()} />;
}

type DashboardFrameProps = {
  children: ReactNode;
  showCredits?: boolean;
};

function DashboardFrame({ children, showCredits = true }: DashboardFrameProps) {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </div>
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-5 w-20 rounded-md" />
          {showCredits ? <SkeletonBlock className="h-6 w-24 rounded-full" /> : null}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export function ScannerPageSkeleton() {
  return (
    <DashboardFrame>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-56" />
          <SkeletonBlock className="h-5 w-80" />
          <SkeletonBlock className="h-5 w-48" />
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white/40 p-6">
          <SkeletonBlock className="mb-3 h-5 w-40" />
          <SkeletonBlock className="h-64 w-full rounded-2xl" />
          <div className="mt-4 flex gap-4">
            <SkeletonBlock className="h-12 w-44" />
            <SkeletonBlock className="h-12 w-40" />
          </div>
        </div>
      </div>
    </DashboardFrame>
  );
}

export function JobsPageSkeleton() {
  return (
    <DashboardFrame showCredits={false}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white/40 p-4">
            <SkeletonBlock className="mb-4 h-6 w-36" />
            <div className="space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>

          <div className="space-y-6 md:col-span-3">
            <div className="rounded-2xl border border-black/[0.06] bg-white/40 p-6">
              <SkeletonBlock className="mb-4 h-8 w-44" />
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <SkeletonBlock className="h-11 w-full rounded-lg" />
                <SkeletonBlock className="h-11 w-full rounded-lg" />
              </div>
              <div className="flex gap-3">
                <SkeletonBlock className="h-11 w-32 rounded-lg" />
                <SkeletonBlock className="h-11 w-28 rounded-lg" />
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-black/[0.06] bg-white/40 p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-7 w-3/5" />
                      <SkeletonBlock className="h-5 w-2/5" />
                      <SkeletonBlock className="h-4 w-1/3" />
                    </div>
                    <SkeletonBlock className="h-14 w-16 rounded-2xl" />
                  </div>
                  <SkeletonBlock className="mb-3 h-4 w-1/4" />
                  <SkeletonBlock className="mb-2 h-4 w-full" />
                  <SkeletonBlock className="mb-2 h-4 w-11/12" />
                  <SkeletonBlock className="mb-4 h-4 w-2/3" />
                  <div className="flex gap-3">
                    <SkeletonBlock className="h-10 w-24 rounded-lg" />
                    <SkeletonBlock className="h-5 w-28 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardFrame>
  );
}

export function CopilotPageSkeleton() {
  return (
    <DashboardFrame>
      <div className="mx-auto max-w-7xl">
        <div className="grid h-[calc(100vh-12rem)] gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white/40 p-4">
            <SkeletonBlock className="mb-4 h-10 w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-black/[0.06] bg-white/40 md:col-span-3">
            <div className="flex-1 space-y-4 p-6">
              <SkeletonBlock className="h-24 w-3/5 rounded-2xl" />
              <SkeletonBlock className="ml-auto h-20 w-1/2 rounded-2xl" />
              <SkeletonBlock className="h-24 w-2/3 rounded-2xl" />
            </div>
            <div className="border-t border-white/20 p-4">
              <div className="flex gap-2">
                <SkeletonBlock className="h-12 flex-1 rounded-lg" />
                <SkeletonBlock className="h-12 w-24 rounded-lg" />
              </div>
              <SkeletonBlock className="mt-3 h-4 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </DashboardFrame>
  );
}

export function JobPacksPageSkeleton() {
  return (
    <DashboardFrame>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-10 w-44" />
            <SkeletonBlock className="h-5 w-56" />
          </div>
          <SkeletonBlock className="h-12 w-40 rounded-lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black/[0.06] bg-white/40 p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-6 w-3/4" />
                  <SkeletonBlock className="h-4 w-1/2" />
                </div>
                <SkeletonBlock className="h-8 w-16 rounded-full" />
              </div>
              <SkeletonBlock className="mb-6 h-4 w-28" />
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardFrame>
  );
}
