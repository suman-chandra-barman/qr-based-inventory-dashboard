import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 6 }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              {colIndex === 0 ? (
                <Skeleton className="h-4 w-4" />
              ) : colIndex === 1 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ) : colIndex === columns - 1 ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
