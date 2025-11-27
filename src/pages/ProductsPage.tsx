import { useState } from "react";
import { ProductTable } from "@/components/tables/ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProductModal } from "@/components/modals/AddProductModal";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const getBreadcrumbCategory = () => {
    if (selectedCategory === "all") return "All Products";
    return selectedCategory;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product</h1>

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>›</span>
            <span>Product</span>
            <span>›</span>
            <span className="text-blue-500 font-medium">
              {getBreadcrumbCategory()}
            </span>
          </nav>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </Button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {showAddModal && (
        <AddProductModal open={showAddModal}  />
      )}
    </div>
  );
}
