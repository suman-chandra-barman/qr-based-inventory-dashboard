import React from "react";
import SalesChart from "../components/charts/SalesChart";
import StatsCards from "../components/cards/StatasCard";
import { OrdersTable } from "../components/tables/OrdersTable";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SalesChart />
        </div>
        <div className="md:col-span-1">
          <StatsCards />
        </div>
      </div>
      <OrdersTable />
    </div>
  );
};

export default DashboardPage;
