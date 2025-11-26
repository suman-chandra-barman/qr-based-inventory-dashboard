/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetAllUsersQuery } from "@/redux/api/api";
import type { User, AssignedCustomer } from "@/types";

const baseUrl = "http://10.10.12.25:5008";

const Assign = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignedCustomers, setAssignedCustomers] = useState<AssignedCustomer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const itemsPerPage = 6;

  // Fetch all users for the modal
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsersQuery({
    page: 1,
    limit: 100,
  });

  // Extract users from API response
  let users: User[] = [];
  if (usersData?.data?.result && Array.isArray(usersData.data.result)) {
    users = usersData.data.result.map((user: User) => ({
      ...user,
      id: user._id || user.id,
    }));
  }

  // Open modal when productId is present
  useEffect(() => {
    if (productId) {
      setIsModalOpen(true);
      setShowDropdown(false);
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
          console.log("All assignments before filter:", result.data.assignProduct);
          
          // Filter assignments for current productId
          const productAssignments = result.data.assignProduct.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => {
              console.log("Checking item:", item);
              console.log("Item productId:", item.productId || item.product?._id);
              console.log("Current productId:", productId);
              return item.productId === productId || item.product?._id === productId;
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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearch(`${user.name} - ${user.email}`);
    setShowDropdown(false);
  };

  const handleAssign = async () => {
    if (!selectedUser || !productId) {
      toast.error("Please select a user");
      return;
    }

    console.log("Starting assignment...");
    console.log("Product ID:", productId);
    console.log("Selected User:", selectedUser);
    console.log("User ID:", selectedUser._id);

    setAssigning(true);

    try {
      const payload = {
        productId: productId,
        userId: selectedUser._id,
      };
      
      console.log("Assignment payload:", payload);

      // API call to assign product
      const response = await fetch(`${baseUrl}/api/v1/assign-product/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("API Response Full:", result);
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      console.log("Error message:", result.message);
      console.log("Error messages array:", result.errorMessages);

      if (response.ok && result.success) {
        toast.success(result.message || "Product assigned successfully!");
        
        // Refetch assignments from API to get updated data
        await fetchAssignedCustomers();
        
        // Reset modal
        setSelectedUser(null);
        setUserSearch("");
      } else if (response.status === 400 && result.message === "Product already assigned") {
        toast.error("This product is already assigned to this user");
        
        // Refetch to ensure we have the latest data
        await fetchAssignedCustomers();
        
        setSelectedUser(null);
        setUserSearch("");
      } else {
        console.error("API Error:", result);
        toast.error(result.message || "Failed to assign product");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign product. Please try again.");
    } finally {
      setAssigning(false);
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
    setSelectedUser(null);
    setUserSearch("");
    setShowDropdown(false);
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

      {/* Assign Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Assign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                User details
              </label>
              <div className="relative">
                <Input
                  placeholder="Select user from list"
                  value={userSearch}
                  onFocus={() => setShowDropdown(true)}
                  readOnly
                  className={`w-full cursor-pointer ${selectedUser ? 'border-green-500' : ''}`}
                />
                {selectedUser && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Selected User:</p>
                    <p className="text-sm text-green-700">{selectedUser.name}</p>
                    <p className="text-xs text-green-600">{selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p className="text-xs text-green-600">{selectedUser.phone}</p>
                    )}
                  </div>
                )}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {loadingUsers ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : users.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No users found
                      </div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                        >
                          {user.image && (
                            <img
                              src={user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          )}
                          {!user.image && (
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-sm text-gray-500">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedUser || assigning}
                className="flex-1 bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assign;