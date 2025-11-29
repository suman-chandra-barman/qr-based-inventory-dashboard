/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ProductTable } from "@/components/tables/ProductTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useCreateProductMutation } from "@/redux/api/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/utils";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [createProduct, { isLoading: creating, error }] =
    useCreateProductMutation();

  const getBreadcrumbCategory = () => {
    if (selectedCategory === "all") return "All Products";
    return selectedCategory;
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const formData = new FormData();
      const data = {
        name: productData.name,
        des: productData.des,
        price: productData.price,
        category: productData.category,
        size: productData.size,
        qrId: productData.qrId,
      };
      formData.append("data", JSON.stringify(data));
      if (productData.image && productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      await createProduct(formData).unwrap();
      toast.success("Product created successfully");
      setShowAddModal(false);
    } catch (error) {
      // Error is handled by the error state
    }
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
        <>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
          <AddProductModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            onSave={handleCreateProduct}
            isLoading={creating}
          />
        </>
      )}
    </div>
  );
}
