import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { Order } from "@/types";
import jsPDF from "jspdf";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  const [downloading, setDownloading] = useState(false);
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async () => {
    setDownloading(true);

    setTimeout(() => {
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
      const createdDate = new Date(order.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
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
        doc.text(
          `$${(item.quantity * item.price).toFixed(2)}`,
          165,
          tableY + 7
        );

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
      setDownloading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Order Details
          </h2>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span className="text-muted-foreground">
                  #{order._id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
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
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-semibold">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Customer:</span>
                <span className="text-muted-foreground">
                  {order.user?.name || "Guest User"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-muted-foreground">
                  {order.user?.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created At:</span>
                <span className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Product Name
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Size
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Quantity
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle font-medium">
                          {item.productId?.name || "Unknown Product"}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {item.productId?.size || "N/A"}
                        </td>
                        <td className="p-4 align-middle">{item.quantity}</td>
                        <td className="p-4 align-middle">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                "Download PDF"
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
