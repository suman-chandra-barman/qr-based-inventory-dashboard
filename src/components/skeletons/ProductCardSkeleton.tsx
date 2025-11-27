import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <Skeleton className="aspect-square mb-3 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-full mt-3 rounded-md" />
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
