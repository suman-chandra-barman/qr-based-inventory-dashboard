import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useGetCategoryDetailsQuery } from "@/redux/api/api";
import { Loader2 } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

interface CategoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  open,
  onOpenChange,
  categoryId,
}) => {
  const { data: categoryDetails, isLoading } = useGetCategoryDetailsQuery(
    categoryId!,
    {
      skip: !categoryId,
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : categoryDetails?.data ? (
          <div className="space-y-4">
            <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={
                  categoryDetails.data.image?.startsWith("http")
                    ? categoryDetails.data.image
                    : `${baseUrl}${categoryDetails.data.image}`
                }
                alt={categoryDetails.data.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Category Name
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {categoryDetails.data.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category ID</p>
                <p className="text-sm text-gray-900 font-mono">
                  {categoryDetails.data._id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-base text-gray-900">
                  {new Date(categoryDetails.data.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-base text-gray-900">
                  {new Date(categoryDetails.data.updatedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No details available</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailsModal;
