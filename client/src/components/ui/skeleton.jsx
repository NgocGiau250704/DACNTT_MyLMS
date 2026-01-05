import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}
