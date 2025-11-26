import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";
import { useGetAllOrdersQuery } from "@/redux/api/api";
import type { Order } from "@/types";

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`;
};

interface TooltipPayload {
  color: string;
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.dataKey === "avgSaleValue"
                ? "Avg Sale Value"
                : "Avg Items per Sale"}
              :
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function SalesChart() {
  const [timePeriod, setTimePeriod] = useState("7 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timePeriods = ["7 days", "14 days", "30 days", "90 days", "1 year"];

  // Fetch all orders
  const { data: ordersData, isLoading } = useGetAllOrdersQuery(
    { limit: 10000 },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
    }
  );

  // Calculate days based on selected period
  const getDaysFromPeriod = (period: string): number => {
    switch (period) {
      case "7 days":
        return 7;
      case "14 days":
        return 14;
      case "30 days":
        return 30;
      case "90 days":
        return 90;
      case "1 year":
        return 365;
      default:
        return 7;
    }
  };

  // Filter orders based on time period
  const filteredOrders = useMemo(() => {
    if (!ordersData?.data?.result) return [];
    
    const days = getDaysFromPeriod(timePeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return ordersData.data.result.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate;
    });
  }, [ordersData, timePeriod]);

  // Calculate chart data grouped by time intervals
  const chartData = useMemo(() => {
    if (filteredOrders.length === 0) return [];

    const days = getDaysFromPeriod(timePeriod);

    const grouped: { [key: string]: { totalSales: number; totalItems: number; count: number } } = {};

    filteredOrders.forEach((order: Order) => {
      const orderDate = new Date(order.createdAt);
      
      let label: string;
      if (days === 7 || days === 14) {
        // Daily labels
        label = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days === 30) {
        // Daily for 30 days
        label = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days === 90) {
        // Weekly labels
        const weekStart = new Date(orderDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        // Monthly labels for 1 year
        label = orderDate.toLocaleDateString('en-US', { month: 'short' });
      }

      if (!grouped[label]) {
        grouped[label] = { totalSales: 0, totalItems: 0, count: 0 };
      }

      grouped[label].totalSales += order.totalAmount;
      grouped[label].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
      grouped[label].count += 1;
    });

    const result = Object.entries(grouped)
      .map(([label, data]) => ({
        label,
        avgSaleValue: data.count > 0 ? data.totalSales / data.count : 0,
        avgItemsPerSale: data.count > 0 ? data.totalItems / data.count : 0,
        totalSales: data.totalSales,
        totalItems: data.totalItems,
        orderCount: data.count,
      }))
      .sort((a, b) => {
        // Sort chronologically
        return new Date(a.label).getTime() - new Date(b.label).getTime();
      });

    return result;
  }, [filteredOrders, timePeriod]);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    if (filteredOrders.length === 0) return { avgSaleValue: 0, avgItemsPerSale: 0, totalSales: 0 };

    const totalSales = filteredOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
    const totalItems = filteredOrders.reduce((sum: number, order: Order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    return {
      avgSaleValue: filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0,
      avgItemsPerSale: filteredOrders.length > 0 ? totalItems / filteredOrders.length : 0,
      totalSales,
    };
  }, [filteredOrders]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Sales this year
        </h1>

        {/* Time Period Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="text-sm font-medium text-gray-700">
              {timePeriod}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {timePeriods.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setTimePeriod(period);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#a3e635] rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            Average Sale Value: ${metrics.avgSaleValue.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            Average Item per sale: {metrics.avgItemsPerSale.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Metrics Cards and Chart Container */}
      <div className="relative">
        {/* Chart */}
        <div className="h-80 mt-8">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No sales data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#9ca3af", fontWeight: 400 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Line
                  type="monotone"
                  dataKey="avgSaleValue"
                  stroke="#a3e635"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#a3e635",
                    strokeWidth: 0,
                  }}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                  strokeLinecap="round"
                />

                <Line
                  type="monotone"
                  dataKey="avgItemsPerSale"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#3b82f6",
                    strokeWidth: 0,
                  }}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesChart;
