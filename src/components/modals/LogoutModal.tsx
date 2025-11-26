import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    dispatch(logout());
    onClose();
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to logout? You will need to login again to
            access your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-4 px-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleLogoutConfirm}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
          >
            Yes, Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
