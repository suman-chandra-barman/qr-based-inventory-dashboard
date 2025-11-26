
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  LogOut,
  LogIn,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { logout } from "@/redux/features/auth/authSlice";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
  activeItem: string;
  onItemClick: (item: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const generalNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: HomeIcon,
    href: "dashboard",
  },
  {
    title: "Products",
    icon: Package,
    href: "products",
  },
  {
    title: "Categories",
    icon: LayoutDashboard,
    href: "categories",
  },
  {
    title: "Customers",
    icon: Users,
    href: "customers",
  },
  {
    title: "Assign",
    icon: Users,
    href: "assign",
  },
];

const toolsNavItems: NavItem[] = [
  {
    title: "Account & Settings",
    icon: Settings,
    href: "settings",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  className,
  activeItem,
  onItemClick,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const handleLogin = () => {
    navigate("/signin");
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = activeItem === item.href;

    const handleClick = (href: string) => {
      onItemClick(href);
      navigate(`/${href}`);
    };

    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-10",
          isActive
            ? "bg-[#D9EDFF] text-[#454545] hover:bg-[#D9EDFF]"
            : "hover:bg-accent hover:text-accent-foreground",
          isCollapsed && "justify-center px-2"
        )}
        onClick={() => handleClick(item.href)}
      >
        <item.icon className={cn("h-4 w-4", isCollapsed ? "h-5 w-5" : "")} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
          </>
        )}
      </Button>
    );
  };

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: NavItem[];
  }) => (
    <div className="space-y-2">
      {!isCollapsed && (
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between p-4 border-border relative">
        <div
          className={cn(
            "w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto",
            isCollapsed ? "hidden" : ""
          )}
        >
          <img src={logo} alt="Logo" className="w-full" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-8 w-8 p-0 cursor-pointer bg-gray-100 hover:bg-gray-200",
            isCollapsed && "mx-auto mt-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <NavSection title="General" items={generalNavItems} />
        <NavSection title="Tools" items={toolsNavItems} />
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border text-red-400">
        {isAuthenticated ? (
          <Button 
            variant="outline" 
            className="w-full text-red-400 hover:text-red-500 hover:bg-red-50"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
            {!isCollapsed && <span>Log out</span>}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={handleLogin}
          >
            <LogIn className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
            {!isCollapsed && <span>Log in</span>}
          </Button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirm Logout</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to logout? You will need to login again to access your account.
            </DialogDescription>
          </DialogHeader>
       <DialogFooter className="flex gap-4 px-2">
  <Button
    variant="outline"
    onClick={() => setIsLogoutModalOpen(false)}
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
    </div>
  );
};

export default Sidebar;
