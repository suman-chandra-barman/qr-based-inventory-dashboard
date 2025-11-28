/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination/Pagination";
import AssignModal from "@/components/modals/AssignModal";
import type { AssignedCustomer } from "@/types";

const baseUrl = "http://10.10.12.25:5008";

const Assign = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedCustomers, setAssignedCustomers] = useState<
    AssignedCustomer[]
  >([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const itemsPerPage = 10;

  // Fetch all users for the modal
  // Open modal when productId is present
  useEffect(() => {
    if (productId) {
      setIsModalOpen(true);
      // Fetch assigned customers from API
      fetchAssignedCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Fetch all assigned customers from API
  const fetchAssignedCustomers = async () => {
    if (!productId) return;

    setLoadingAssignments(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/assign-product/get-all-assign-product?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();
      console.log("All assigned products API response:", result);
      console.log("assignProduct array:", result.data?.assignProduct);
      console.log("assignProduct length:", result.data?.assignProduct?.length);

      if (response.ok && result.success && result.data?.assignProduct) {
        if (Array.isArray(result.data.assignProduct)) {
          console.log(
            "All assignments before filter:",
            result.data.assignProduct
          );

          // Filter assignments for current productId
          const productAssignments = result.data.assignProduct.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => {
              console.log("Checking item:", item);
              console.log(
                "Item productId:",
                item.productId || item.product?._id
              );
              console.log("Current productId:", productId);
              return (
                item.productId === productId || item.product?._id === productId
              );
            }
          );

          console.log("Filtered assignments for product:", productAssignments);

          if (productAssignments.length > 0) {
            // Map the assigned products to customer format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedCustomers = productAssignments.map((item: any) => ({
              id: item.user?._id || item.userId,
              _id: item.user?._id || item.userId,
              name: item.user?.name || "Unknown",
              email: item.user?.email || "N/A",
              phone: item.user?.phone || "N/A",
              image: item.user?.image,
              purchases: 0,
              address: "N/A",
              productId: productId,
            }));

            console.log("Mapped assigned customers:", mappedCustomers);
            setAssignedCustomers(mappedCustomers);
          } else {
            console.log("No assigned customers found for this product");
            setAssignedCustomers([]);
          }
        } else {
          console.log("assignProduct is not an array");
          setAssignedCustomers([]);
        }
      } else {
        console.log("API response not successful or no data");
        setAssignedCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching assigned customers:", error);
      setAssignedCustomers([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleUnassign = async (customerId: string) => {
    try {
      // Remove from the list
      setAssignedCustomers((prev) => prev.filter((c) => c.id !== customerId));
      toast.success("Customer unassigned successfully");
    } catch (error) {
      toast.error("Failed to unassign customer");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(paginatedCustomers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Don't navigate away - stay on assign page
  };

  // Pagination for assigned customers
  const totalPages = Math.ceil(assignedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = assignedCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isAllSelected =
    paginatedCustomers.length > 0 &&
    selectedCustomers.length === paginatedCustomers.length;
  const isIndeterminate =
    selectedCustomers.length > 0 &&
    selectedCustomers.length < paginatedCustomers.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Assign Customer List
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>›</span>
            <span>Product</span>
            <span>›</span>
            <span className="text-blue-600">Assign Customer</span>
          </div>
        </div>
        <Button
          onClick={() => navigate("/products")}
          variant="outline"
          className="rounded-full"
        >
          Back to Products
        </Button>
      </div>

      {/* Debug Info */}
      {assignedCustomers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Total Assigned Customers: {assignedCustomers.length}
          </p>
        </div>
      )}

      {/* Assigned Customers Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Name Customer
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Contact
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Purchases
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Address
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody key={assignedCustomers.length}>
              {loadingAssignments ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                    <p className="text-gray-500 mt-2">Loading assignments...</p>
                  </td>
                </tr>
              ) : assignedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No assigned customers yet
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) =>
                          handleSelectCustomer(customer.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-blue-600">
                          ID {customer._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-900">{customer.email}</p>
                        <p className="text-sm text-gray-500">
                          {customer.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900">
                      ${customer.purchases?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-4 text-gray-900">
                      {customer.address || "N/A"}
                    </td>
                    <td className="p-4">
                      <Button
                        onClick={() => handleUnassign(customer.id)}
                        className="rounded-full px-4"
                        style={{ backgroundColor: "#FF5B28", color: "white" }}
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Assign Modal (re-usable) */}
      <AssignModal
        productId={productId}
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        onAssigned={() => fetchAssignedCustomers()}
      />
    </div>
  );
};

export default Assign;
