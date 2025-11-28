/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetAllUsersQuery } from "@/redux/api/api";
import type { User } from "@/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;;

export type AssignModalProps = {
  productId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
};

export const AssignModal = ({
  productId,
  open,
  onOpenChange,
  onAssigned,
}: AssignModalProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [assigning, setAssigning] = useState(false);

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

  useEffect(() => {
    if (open) {
      setShowDropdown(false);
      setSelectedUser(null);
      setUserSearch("");
    }
  }, [open]);

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

    setAssigning(true);

    try {
      const payload = {
        productId: productId,
        userId: selectedUser._id,
      };

      const response = await fetch(`${baseUrl}/api/v1/assign-product/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Product assigned successfully!");
        setSelectedUser(null);
        setUserSearch("");
        if (onAssigned) onAssigned();
      } else if (
        response.status === 400 &&
        result.message === "Product already assigned"
      ) {
        toast.error("This product is already assigned to this user");
        if (onAssigned) onAssigned();
        setSelectedUser(null);
        setUserSearch("");
      } else {
        toast.error(result.message || "Failed to assign product");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign product. Please try again.");
    } finally {
      setAssigning(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                className={`w-full cursor-pointer ${
                  selectedUser ? "border-green-500" : ""
                }`}
              />
              {selectedUser && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    Selected User:
                  </p>
                  <p className="text-sm text-green-700">{selectedUser.name}</p>
                  <p className="text-xs text-green-600">{selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-xs text-green-600">
                      {selectedUser.phone}
                    </p>
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
                            src={
                              user.image.startsWith("http")
                                ? user.image
                                : `${baseUrl}${user.image}`
                            }
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
              onClick={() => onOpenChange(false)}
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
  );
};

export default AssignModal;
