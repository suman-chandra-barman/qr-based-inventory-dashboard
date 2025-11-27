import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between h-64 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col justify-end items-center gap-2"
            >
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChartSkeleton;
