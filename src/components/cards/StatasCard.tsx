import React from "react";
import { useGetDashboardStatisticsQuery } from "@/redux/api/api";
import StatCard from "./StatCard";
import { StatCardSkeleton } from "@/components/skeletons";

const StatsCards: React.FC = () => {
  const { data: dashboardData, isLoading } = useGetDashboardStatisticsQuery(
    undefined,
    {
      refetchOnFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
    }
  );

  const totalProducts = dashboardData?.data?.totalProducts || 0;
  const totalUsers = dashboardData?.data?.totalUsers || 0;

  if (isLoading) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 h-full">
      <StatCard
        title="Total Product"
        value={totalProducts.toString()}
        className="hover:shadow-md transition-shadow justify-between bg-[#003366FC] h-48"
      />

      <StatCard
        title="Total Customers"
        value={totalUsers.toString()}
        className="hover:shadow-md transition-shadow justify-between h-48"
      />
    </div>
  );
};

export default StatsCards;
