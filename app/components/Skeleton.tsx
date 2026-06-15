import React from 'react';

// Skeleton loader component - perfect for YouTube/Facebook style UX
export function Skeleton({ 
  width = "100%", 
  height = "24px", 
  className = "", 
  rounded = "md"
}: { 
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}) {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  };
  
  return (
    <div 
      className={`animate-pulse bg-[#25303a] ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}

// Pre-made skeleton for profile cards
export function ProfileSkeleton() {
  return (
    <div className="bg-[#25303a] p-10 rounded-[2rem] border border-[#e5ad46]/5 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton width="80px" height="80px" rounded="full" />
        <div className="space-y-2">
          <Skeleton width="200px" height="28px" />
          <Skeleton width="120px" height="16px" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton height="40px" />
        <Skeleton height="40px" />
        <Skeleton height="40px" width="80%" />
      </div>
    </div>
  );
}

// Pre-made skeleton for cards
export function CardSkeleton() {
  return (
    <div className="bg-[#25303a] p-6 rounded-[2rem] border border-[#e5ad46]/5 shadow-sm space-y-4">
      <Skeleton width="60px" height="60px" rounded="xl" />
      <Skeleton width="150px" height="24px" />
      <Skeleton height="48px" />
      <Skeleton height="40px" width="50%" />
    </div>
  );
}

// Text line skeleton
export function TextSkeleton({ lines = 3, className = "" }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          height="16px"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

// Page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#1e2a38] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Skeleton width="120px" height="14px" className="mx-auto mb-6" />
          <Skeleton width="400px" height="56px" className="mx-auto" />
        </div>
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-8">
            <CardSkeleton />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-[#25303a] rounded-[2.5rem] border border-[#e5ad46]/5 p-8 space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} height="60px" />
              ))}
              <Skeleton height="80px" width="40%" className="mt-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
