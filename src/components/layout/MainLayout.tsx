import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useState } from "react";

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        className="fixed"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={cn("flex-1 flex flex-col")}>
        <div
          className={cn(
            "fixed right-0 left-0 z-10 transition-all duration-300",
            isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <Header />
        </div>
        <main
          className={cn(
            "mt-20 transition-all duration-300",
            isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
