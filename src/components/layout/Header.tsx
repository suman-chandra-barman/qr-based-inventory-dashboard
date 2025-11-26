import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Link } from "react-router";
import { useGetAdminNotificationsQuery } from "@/redux/api/api";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const Header: React.FC = () => {
  const { data: notificationsData } = useGetAdminNotificationsQuery({});
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Construct full image URL
  const baseUrl = "http://10.10.12.25:5008";
  const userImage = user?.image 
    ? (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image.startsWith('/') ? '' : '/'}${user.image}`)
    : "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg";
  
  // Extract notification count from API response
  // Backend returns: { success, message, data: { result: [], meta: { unread, total } } }
  let notificationCount = 0;
  
  if (notificationsData?.data) {
    const dataObj = notificationsData.data;
    
    // Prefer unread count from meta, fallback to total notifications
    if (dataObj.meta?.unread !== undefined) {
      notificationCount = dataObj.meta.unread;
    } else if (dataObj.meta?.total !== undefined) {
      notificationCount = dataObj.meta.total;
    } else if (Array.isArray(dataObj.result)) {
      // Count unread notifications from result array
      notificationCount = dataObj.result.filter((n: { read: boolean }) => !n.read).length;
    }
  }

  return (
    <header
      className={`h-20 border-b border-border bg-gray-50 px-6 flex justify-end items-center gap-6`}
    >
      {/* User Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 text-white border-0">
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>

        <Link to="/settings/personal-information">
          <div className="flex items-center gap-3 border-l-2 border-border pl-4">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={userImage} 
                alt={user?.name || "User"}
                className="object-cover"
              />
              <AvatarFallback>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{user?.name || "Admin"}</span>
              <p className="text-sm text-muted-foreground capitalize">
                {user?.role?.toLowerCase() || "admin"}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
