import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import type { Product, Customer, DetailsModalProps } from "@/types";

export function DetailsModal({
  data,
  type,
  isOpen,
  onClose,
}: DetailsModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !data) return null;

  const handleDownload = async () => {
    setDownloading(true);

    setTimeout(() => {
      const doc = new jsPDF();

      // Set page background color (light gray)
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, "F");

      // Header section with blue background
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 50, "F");

      // Company/Header title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(
        type === "product" ? "PRODUCT DETAILS" : "CUSTOMER DETAILS",
        105,
        25,
        { align: "center" }
      );

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Generated on " + new Date().toLocaleDateString(), 105, 35, {
        align: "center",
      });

      doc.setFillColor(255, 255, 255);
      doc.rect(15, 65, 180, 180, "F");

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.rect(15, 65, 180, 180, "S");

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        type === "product" ? "Product Information" : "Customer Information",
        25,
        85
      );

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      let details: { label: string; value: string }[] = [];

      if (type === "product") {
        const product = data as Product;
        const categoryName = typeof product.category === 'object' && product.category !== null 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (product.category as any).name 
          : product.category;
        
        // Format date from backend (createdAt or date field)
        let formattedDate = "N/A";
        if (product.date) {
          formattedDate = product.date;
        } else if (product.createdAt) {
          formattedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } else if (product.updatedAt) {
          formattedDate = new Date(product.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        details = [
          { label: "User Name:", value: "Enrique" },
          { label: "Product Name:", value: product.name },
          { label: "Phone Number:", value: "098 893459" },
          { label: "Date:", value: formattedDate },
          { label: "Price:", value: `$${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || '0')).toFixed(2)}` },
          { label: "Product ID:", value: product.id },
          { label: "Category:", value: categoryName },
          { label: "Size:", value: `${product.size} units` },
        ];
      } else {
        const customer = data as Customer;
        details = [
          { label: "User Name:", value: customer.name },
          { label: "Email:", value: customer.email },
          { label: "Phone Number:", value: customer.phone },
          { label: "Date:", value: new Date().toLocaleDateString() },
          { label: "Customer ID:", value: customer.id },
          {
            label: "Total Purchases:",
            value: `$${customer.purchases.toFixed(2)}`,
          },
          { label: "Address:", value: customer.address },
        ];
      }

      let yPosition = 105;
      details.forEach((detail, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(20, yPosition - 10, 170, 18, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text(detail.label, 25, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(31, 41, 55);

        const maxWidth = 70;
        const textLines = doc.splitTextToSize(detail.value, maxWidth);
        doc.text(textLines, 120, yPosition);

        yPosition += 18;
      });

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.line(25, 235, 185, 235);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Management System", 105, 250, { align: "center" });

      doc.save(`${type}-details-${data.id.replace(/\s+/g, "-")}.pdf`);
      setDownloading(false);
    }, 1000);
  };

  const renderModalContent = () => {
    if (type === "product") {
      const product = data as Product;
      const categoryName = typeof product.category === 'object' && product.category !== null 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (product.category as any).name 
        : product.category;
      return (
        <>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">User Name:</span>
            <span className="text-gray-800 font-medium">Enrique</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Product Name:</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Phone Number:</span>
            <span className="text-gray-800 font-medium">098 893459</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-800 font-medium">
              {product.date || (product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"))}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Price:</span>
            <span className="text-gray-800 font-medium">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || '0')).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Product ID:</span>
            <span className="text-gray-800 font-medium">{product.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Category:</span>
            <span className="text-gray-800 font-medium">
              {categoryName}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Size:</span>
            <span className="text-gray-800 font-medium">
              {product.size} units
            </span>
          </div>
        </>
      );
    } else {
      const customer = data as Customer;
      return (
        <>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">User Name:</span>
            <span className="text-gray-800 font-medium">{customer.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-800 font-medium">{customer.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Phone Number:</span>
            <span className="text-gray-800 font-medium">{customer.phone}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-800 font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {type === "product" ? "Product Details" : "Customer Details"}
          </h2>

          <div className="space-y-4">{renderModalContent()}</div>

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 mt-6 rounded-full"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              "Download"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
