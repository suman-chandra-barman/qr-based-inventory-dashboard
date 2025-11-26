import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useGetAllOrdersQuery } from "@/redux/api/api";
import type { StatCardProps, Order } from "@/types";

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  subtitle,
  className,
}) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${title === "Total Product Balance" ? "text-white" : "text-muted-foreground"}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className={`text-2xl font-bold ${title === "Total Product Balance" ? "text-white" : "text-gray-900"}`}>{value}</div>
          <div className="text-sm mt-1">
            <div className="flex items-center gap-1 justify-end">
              {trend === "up" ? (
                <TrendingUp className={`h-3 w-3 ${title === "Total Product Balance" ? "text-green-300" : "text-green-500"}`} />
              ) : (
                <TrendingDown className={`h-3 w-3 ${title === "Total Product Balance" ? "text-red-300" : "text-red-500"}`} />
              )}
              <span
                className={title === "Total Order Balance" 
                  ? (trend === "up" ? "text-green-300" : "text-red-300")
                  : (trend === "up" ? "text-green-500" : "text-red-500")
                }
              >
                {change}
              </span>
            </div>
            {subtitle && (
              <p className={`ml-1 text-end ${title === "Total Product Balance" ? "text-[#F6F6F6]" : "text-muted-foreground"}`}>{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsCards: React.FC = () => {
  // Fetch all orders with auto-refetch options
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery(
    { limit: 10000 },
    {
      pollingInterval: 30000, // Auto-refetch every 30 seconds
      refetchOnFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
    }
  );

  // Calculate total product balance (sum of all order totalAmounts)
  let totalProductBalance = 0;
  if (ordersData?.data?.result && Array.isArray(ordersData.data.result)) {
    totalProductBalance = ordersData.data.result.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
  }

  // Calculate total customers (total orders count)
  const totalCustomers = ordersData?.data?.meta?.total || 0;

  const isLoading = ordersLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow justify-between bg-[#003366FC]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow justify-between">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <StatCard
        title="Total Product Balance"
        value={`$${totalProductBalance.toFixed(2)}`}
        change="10.1%"
        trend="up"
        subtitle="from all orders"
        className="hover:shadow-md transition-shadow justify-between bg-[#003366FC]"
      />
      <StatCard
        title="Total Customer"
        value={totalCustomers.toString()}
        change="+1.6%"
        trend="up"
        subtitle="total orders"
        className="hover:shadow-md transition-shadow justify-between"
      />
    </div>
  );
};

export default StatsCards;
