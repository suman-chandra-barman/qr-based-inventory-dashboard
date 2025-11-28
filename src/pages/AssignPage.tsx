/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AssignProductTable } from "@/components/tables/AssignProductTable";

export default function AssignPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getBreadcrumbCategory = () => {
    if (selectedCategory === "all") return "All Products";
    return selectedCategory;
  };


  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Product</h2>
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>›</span>
            <span>Assign</span>
            <span>›</span>
            <span className="text-blue-500 font-medium">
              {getBreadcrumbCategory()}
            </span>
          </nav>
  
        </div>
      </div>

      {/* Product Table */}
      <AssignProductTable
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
}
