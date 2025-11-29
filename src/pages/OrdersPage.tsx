import { OrdersTable } from "@/components/tables/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders</h1>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>›</span>
          <span className="text-blue-500 font-medium">Orders</span>
        </nav>
      </div>

      {/* Orders Table */}
      <OrdersTable />
    </div>
  );
}
