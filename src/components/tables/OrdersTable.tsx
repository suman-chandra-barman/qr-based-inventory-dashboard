import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useGetAllOrdersQuery } from "@/redux/api/api";
import type { Order } from "@/types";
import { Pagination } from "../pagination/Pagination";
import { TableSkeleton } from "@/components/skeletons";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDetailsModal } from "../modals/OrderDetailsModal";
import jsPDF from "jspdf";

export function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const totalCount =
    ordersData?.data?.meta?.total ||
    ordersData?.data?.pagination?.total ||
    orders.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle PDF download
  const handleDownload = (order: Order) => {
    const doc = new jsPDF();

    // Set page background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Header - Blue gradient
    doc.setFillColor(73, 144, 254);
    doc.rect(0, 0, 210, 50, "F");
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 35, 210, 15, "F");

    // Title - ORDER RECEIPT
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER RECEIPT", 105, 28, { align: "center" });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
    doc.text(
      `Generated on ${orderDate} | Order #${order._id
        ?.slice(-6)
        .toUpperCase()}`,
      105,
      43,
      { align: "center" }
    );

    // Order Information Section
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(20, 60, 170, 60, "S");

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 25, 73);

    // Left column details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("Order ID:", 30, 88);
    doc.text("Customer:", 30, 98);
    doc.text("Status:", 30, 108);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    doc.text(`#${order._id?.slice(-6).toUpperCase()}`, 80, 88);
    doc.text(order.user?.name || "Guest User", 80, 98);
    doc.text(
      order.status.charAt(0).toUpperCase() + order.status.slice(1),
      80,
      108
    );

    // Right column details
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("Email:", 110, 88);
    doc.text("Date:", 110, 98);
    doc.text("Total Amount:", 110, 108);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    const emailText = order.user?.email || "N/A";
    doc.text(
      emailText.length > 25 ? emailText.substring(0, 25) + "..." : emailText,
      145,
      88
    );
    const createdDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    doc.text(createdDate, 145, 98);
    doc.setFont("helvetica", "bold");
    doc.text(`$${order.totalAmount.toFixed(2)}`, 145, 108);

    // Order Items Section
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(20, 130, 170, 20, "S");

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Order Items", 25, 143);

    // Table header
    let tableY = 160;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, tableY, 170, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Product", 25, tableY + 7);
    doc.text("Size", 90, tableY + 7);
    doc.text("Qty", 115, tableY + 7);
    doc.text("Price", 135, tableY + 7);
    doc.text("Total", 165, tableY + 7);

    // Table rows
    tableY += 10;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);

    order.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, tableY, 170, 10, "F");
      }

      const productName = item.productId?.name || "Unknown";
      doc.text(
        productName.length > 20
          ? productName.substring(0, 20) + "..."
          : productName,
        25,
        tableY + 7
      );
      doc.text(item.productId?.size || "N/A", 90, tableY + 7);
      doc.text(item.quantity.toString(), 115, tableY + 7);
      doc.text(`$${item.price.toFixed(2)}`, 135, tableY + 7);
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 165, tableY + 7);

      tableY += 10;
    });

    // Total row
    doc.setFillColor(59, 130, 246);
    doc.rect(20, tableY, 170, 10, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ORDER TOTAL", 135, tableY + 7);
    doc.text(`$${order.totalAmount.toFixed(2)}`, 165, tableY + 7);

    // Footer
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 275, 190, 275);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for your business! | QR-Based Inventory Management System",
      105,
      285,
      { align: "center" }
    );

    doc.save(`order-receipt-${order._id?.slice(-6).toUpperCase()}.pdf`);
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                        {order.user?.name || "Guest User"}
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
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(order)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
