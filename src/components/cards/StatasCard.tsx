import React from "react";
import { useGetDashboardStatisticsQuery } from "@/redux/api/api";
import StatCard from "./StatCard";
import { StatCardSkeleton } from "@/components/skeletons";

const StatsCards: React.FC = () => {
  const { data: dashboardData, isLoading } = useGetDashboardStatisticsQuery(
    undefined,
    {
      pollingInterval: 30000, // Auto-refetch every 30 seconds
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
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <StatCard
        title="Total Product"
        value={totalProducts.toString()}
        className="hover:shadow-md transition-shadow justify-between bg-[#003366FC]"
      />

      <StatCard
        title="Total Customers"
        value={totalUsers.toString()}
        className="hover:shadow-md transition-shadow justify-between"
      />
    </div>
  );
};

export default StatsCards;
