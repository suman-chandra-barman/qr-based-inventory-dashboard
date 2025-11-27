/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ChevronDown } from "lucide-react";
import { ChartSkeleton } from "@/components/skeletons";
import { useGetEarningChartDataQuery } from "@/redux/api/api";

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

interface ChartDataItem {
  label: string;
  totalAmount: number;
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
            <span className="text-sm text-gray-700">Total Earnings:</span>
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
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch earning chart data
  const { data: earningData, isLoading } = useGetEarningChartDataQuery(
    selectedYear,
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
    }
  );

  // Extract available years from data
  const availableYears = useMemo(() => {
    if (!earningData?.data) return [];
    return earningData.data.map((item: any) => item._id);
  }, [earningData]);

  // Set default year when data loads
  useMemo(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Transform API data to chart format
  const chartData = useMemo(() => {
    if (!earningData?.data || earningData.data.length === 0) return [];

    const yearData = earningData.data.find(
      (item: any) => item._id === selectedYear
    );
    if (!yearData || !yearData.earnings) return [];

    return yearData.earnings.map((earning: any) => ({
      label: earning.month,
      totalAmount: earning.totalAmount,
    }));
  }, [earningData, selectedYear]);

  // Calculate total earnings for the year
  const totalEarnings = useMemo(() => {
    return chartData.reduce(
      (sum: number, item: ChartDataItem) => sum + item.totalAmount,
      0
    );
  }, [chartData]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>

        {/* Year Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="text-sm font-medium text-gray-700">
              {selectedYear || "Select Year"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {availableYears.map((year: string) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
                >
                  {year}
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
            Total Earnings: ${totalEarnings.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Metrics Cards and Chart Container */}
      <div className="relative flex-1 flex flex-col">
        {/* Chart */}
        <div className="flex-1 mt-8 min-h-0">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No earnings data for this year</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#9ca3af", fontWeight: 400 }}
                  dy={10}
                  interval={0}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Line
                  type="monotone"
                  dataKey="totalAmount"
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
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesChart;
