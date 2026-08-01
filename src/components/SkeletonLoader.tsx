import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 h-80 w-full" />

      {/* 7-Day Forecast Grid Skeleton */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 h-64 w-full" />

      {/* Analytics Chart Skeleton */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 h-80 w-full" />
    </div>
  );
};
