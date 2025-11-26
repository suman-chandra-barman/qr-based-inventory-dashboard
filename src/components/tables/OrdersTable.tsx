import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useGetAllOrdersQuery } from "@/redux/api/api";
import type { Order } from "@/types";
import { Pagination } from "../pagination/Pagination";

export function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch orders from API
  const { data: ordersData, isLoading } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Extract data from API response
  let orders: Order[] = [];
  if (ordersData?.data) {
    const dataObj = ordersData.data;
    let rawOrders = [];
    if (Array.isArray(dataObj.result)) {
      rawOrders = dataObj.result;
    } else if (Array.isArray(dataObj.data)) {
      rawOrders = dataObj.data;
    } else if (Array.isArray(dataObj.orders)) {
      rawOrders = dataObj.orders;
    }
    
    // Map _id to id for frontend compatibility
    orders = rawOrders.map((order: Order) => ({
      ...order,
      id: order._id || order.id,
    }));
  }

  // Calculate total pages from total count and items per page
  const totalCount = ordersData?.data?.meta?.total || ordersData?.data?.pagination?.total || orders.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate total items in order
  const getTotalItems = (items: { quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${totalCount} total orders`}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Order ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Items
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle text-muted-foreground font-mono text-sm">
                      #{order._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {getTotalItems(order.items)} item(s)
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium">
                        {order.user || "Guest User"}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          order.status === "delivered" ? "default" : "secondary"
                        }
                        className={
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : order.status === "canceled"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        <div
                          className={`mr-1 h-2 w-2 rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-600"
                              : order.status === "canceled"
                              ? "bg-red-600"
                              : order.status === "processing"
                              ? "bg-blue-600"
                              : "bg-yellow-600"
                          }`}
                        />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
