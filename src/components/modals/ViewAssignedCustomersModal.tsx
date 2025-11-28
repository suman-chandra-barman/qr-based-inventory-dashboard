import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetAssignedCustomersQuery,
  useDeleteAssignedCustomerMutation,
} from "@/redux/api/api";
import type { AssignedProductData } from "@/types";
import { Trash2, Mail, Calendar, Loader2, Users, Package } from "lucide-react";
import { toast } from "sonner";

interface ViewAssignedCustomersModalProps {
  productId: string | null;
  productName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewAssignedCustomersModal({
  productId,
  productName,
  open,
  onOpenChange,
}: ViewAssignedCustomersModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, refetch } = useGetAssignedCustomersQuery(productId, {
    skip: !productId || !open,
  });

  const [deleteAssignedCustomer] = useDeleteAssignedCustomerMutation();

  const assignedCustomers: AssignedProductData[] =
    data?.data?.assignProduct || [];
  const totalAssigned = data?.data?.meta?.total || 0;

  const openDeleteConfirm = (assignId: string, userName: string) => {
    setCustomerToDelete({ id: assignId, name: userName });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    setDeleteConfirmOpen(false);
    setDeletingId(customerToDelete.id);
    try {
      await deleteAssignedCustomer(customerToDelete.id).unwrap();
      toast.success(
        `Successfully removed ${customerToDelete.name} from this product`
      );
      refetch();
    } catch (error) {
      console.error("Failed to delete assigned customer:", error);
      toast.error("Failed to remove customer. Please try again.");
    } finally {
      setDeletingId(null);
      setCustomerToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span>Assigned Customers</span>
              {productName && (
                <span className="text-sm font-normal text-gray-500 flex items-center gap-1 mt-0.5">
                  <Package className="h-3.5 w-3.5" />
                  {productName}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Total Assigned:{" "}
              <span className="font-semibold text-blue-600">
                {totalAssigned}
              </span>
            </span>
            {totalAssigned > 0 && (
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                Scroll to see all
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-500 text-sm">
                  Loading assigned customers...
                </p>
              </div>
            ) : assignedCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No customers assigned
                </p>
                <p className="text-gray-400 text-sm text-center max-w-xs">
                  This product hasn't been assigned to any customers yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedCustomers.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {assignment.userId.image ? (
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${
                              assignment.userId.image
                            }`}
                            alt={assignment.userId.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                            {assignment.userId.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {assignment.userId.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {assignment.userId.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Assigned on {formatDate(assignment.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openDeleteConfirm(
                              assignment._id,
                              assignment.userId.name
                            )
                          }
                          disabled={deletingId === assignment._id}
                          className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove assignment"
                        >
                          {deletingId === assignment._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Customer Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{customerToDelete?.name}" from
              this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
