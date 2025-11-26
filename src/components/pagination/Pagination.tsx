import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaginationProps } from "@/types"

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(currentPage - half, 1)
    const end = Math.min(start + maxVisiblePages - 1, totalPages)

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()
  const showStartEllipsis = visiblePages[0] > 1
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-sm text-muted-foreground mr-2">The page on</span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {showPageNumbers && (
          <>
            {showStartEllipsis && (
              <>
                <Button variant="outline" size="sm" onClick={() => onPageChange(1)} className="h-8 w-8 p-0">
                  1
                </Button>
                {visiblePages[0] > 2 && <span className="text-muted-foreground px-1">...</span>}
              </>
            )}

            {visiblePages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn("h-8 w-8 p-0", currentPage === page && "bg-primary text-primary-foreground")}
              >
                {page}
              </Button>
            ))}

            {showEndEllipsis && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="text-muted-foreground px-1">...</span>
                )}
                <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)} className="h-8 w-8 p-0">
                  {totalPages}
                </Button>
              </>
            )}
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  )
}
