import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Bell, User, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGetAdminNotificationsQuery } from "@/redux/api/api";
import type { RootState } from "@/redux/store";

import LogoutModal from "@/components/modals/LogoutModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface NotificationData {
  data?: {
    result?: Array<{ read: boolean }>;
    meta?: {
      unread?: number;
      total?: number;
    };
  };
}

const constructImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const getNotificationCount = (data: NotificationData | undefined): number => {
  if (!data?.data) return 0;

  const { meta, result } = data.data;

  if (meta?.unread !== undefined) {
    return meta.unread;
  }

  if (meta?.total !== undefined) {
    return meta.total;
  }

  if (Array.isArray(result)) {
    return result.filter((notification) => !notification.read).length;
  }

  return 0;
};

const formatNotificationCount = (count: number): string => {
  return count > 99 ? "99+" : count.toString();
};

const getUserInitials = (name: string | undefined): string => {
  if (!name) return "AD";
  return name.substring(0, 2).toUpperCase();
};

interface NotificationButtonProps {
  count: number;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ count }) => (
  <Button variant="ghost" size="sm" className="relative">
    <Bell className="h-4 w-4" />
    {count > 0 && (
      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 text-white border-0">
        {formatNotificationCount(count)}
      </Badge>
    )}
  </Button>
);

interface UserMenuProps {
  user: {
    name?: string;
    role?: string;
    image?: string;
  } | null;
  userImage: string;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, userImage, onLogout }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <div className="flex items-center gap-3 border-l-2 border-border pl-4 cursor-pointer hover:bg-gray-100 pr-4 py-2 rounded-r-md transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={userImage}
            alt={user?.name || "User"}
            className="object-cover"
          />
          <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div>
          <span className="font-medium">{user?.name || "Admin"}</span>
          <p className="text-sm text-muted-foreground capitalize">
            {user?.role?.toLowerCase() || "admin"}
          </p>
        </div>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem asChild>
        <Link
          to="/settings/personal-information"
          className="flex items-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={onLogout}
        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Header: React.FC = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: notificationsData } = useGetAdminNotificationsQuery({});

  const userImage = useMemo(
    () => constructImageUrl(user?.image),
    [user?.image]
  );
  const notificationCount = useMemo(
    () => getNotificationCount(notificationsData),
    [notificationsData]
  );

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="h-20 border-b border-border bg-gray-50 px-6 flex justify-end items-center gap-6">
        <div className="flex items-center gap-4">
          <NotificationButton count={notificationCount} />
          <UserMenu user={user} userImage={userImage} onLogout={handleLogout} />
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
      />
    </>
  );
};

export default Header;
