import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatCardSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <Card className="bg-[#003366FC]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24 bg-blue-300/30" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 bg-blue-300/30" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28 bg-gray-200" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 bg-gray-200" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCardSkeleton;
