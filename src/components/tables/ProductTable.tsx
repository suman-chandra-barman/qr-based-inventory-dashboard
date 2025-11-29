/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ArrowUpRight, Trash2, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "../pagination/Pagination";
import { DetailsModal } from "../modals/DetailsModal";
import { AddProductModal } from "../modals/AddProductModal";
import AssignModal from "@/components/modals/AssignModal";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetAllCategoriesQuery,
} from "@/redux/api/api";
import type { Product, ProductTableProps, Category } from "@/types";
import { TableSkeleton } from "@/components/skeletons";

export function ProductTable({
  selectedCategory,
  onCategoryChange,
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignProductId, setAssignProductId] = useState<string | null>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  // Fetch categories from API
  const { data: categoriesData } = useGetAllCategoriesQuery({
    limit: 100, // Fetch all categories without pagination
  });

  // Fetch products from API
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetAllProductsQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  // Extract products from API response and normalize _id to id
  let products: Product[] = [];
  if (productsData?.data) {
    const dataObj = productsData.data;
    const rawProducts = Array.isArray(dataObj.data)
      ? dataObj.data
      : Array.isArray(dataObj.products)
      ? dataObj.products
      : Array.isArray(dataObj.result)
      ? dataObj.result
      : [];

    products = rawProducts.map((product: any) => ({
      ...product,
      id: product._id || product.id,
    }));
  }

  const totalPages =
    productsData?.data?.meta?.totalPages ||
    productsData?.data?.pagination?.totalPages ||
    1;

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    setCurrentPage(1);
    setSelectedProducts([]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(
      checked ? products.map((product: Product) => product.id) : []
    );
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map((id) => deleteProduct(id).unwrap())
      );
      toast.success(
        `Successfully deleted ${selectedProducts.length} product(s)`
      );
      setSelectedProducts([]);
      refetch();
    } catch (error) {
      // Error is now handled globally in the API
    }
  };

  const handleSingleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully");
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      refetch();
    } catch (error) {
      // Error is now handled globally in the API
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (productData: any, productId?: string) => {
    if (!productId) return;

    try {
      const formData = new FormData();

      const data = {
        name: productData.name,
        des: productData.des,
        price: productData.price,
        category: productData.category,
        size: productData.size,
      };
      formData.append("data", JSON.stringify(data));

      if (productData.image && productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      await updateProduct({ id: productId, data: formData }).unwrap();
      toast.success("Product updated successfully");
      setProductToEdit(null);
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      // Error is now handled globally in the API
    }
  };

  const handleActionClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const isAllSelected =
    products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate =
    selectedProducts.length > 0 && selectedProducts.length < products.length;

  // Extract categories from API response
  let apiCategories: Category[] = [];
  if (
    categoriesData?.data?.result &&
    Array.isArray(categoriesData.data.result)
  ) {
    apiCategories = categoriesData.data.result.map((category: Category) => ({
      ...category,
      id: category._id || category.id,
    }));
  }

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const categoryTabs = [
    { key: "all", label: "All" },
    ...apiCategories.map((category) => ({
      key: category.name,
      label: category.name,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="bg-gray-50 rounded-lg p-1 flex gap-2 flex-wrap">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryClick(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === tab.key
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700">
            {selectedProducts.length} product(s) selected
          </span>
          <Button
            onClick={handleBulkDelete}
            disabled={deleting}
            variant="destructive"
            size="sm"
            className="ml-auto"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </>
            )}
          </Button>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Price
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Size
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Date
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product: Product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            product.image as string
                          }`}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-blue-600">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900">
                      $
                      {typeof product.price === "number"
                        ? product.price.toFixed(2)
                        : parseFloat(String(product.price || "0")).toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-900">{product.size}</td>
                    <td className="p-4 text-gray-500">
                      <div>
                        <p>
                          {product.date ||
                            (product.createdAt
                              ? new Date(product.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "N/A")}
                        </p>
                        <p className="text-sm">
                          at{" "}
                          {product.time ||
                            (product.createdAt
                              ? new Date(product.createdAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : "N/A")}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActionClick(product)}
                          title="View details"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          disabled={updating}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSingleDelete(product.id)}
                          disabled={deleting}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setAssignProductId(product.id);
                            setIsAssignModalOpen(true);
                          }}
                          className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full px-4"
                          title="Assign product"
                        >
                          Assign Product
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

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Product Details */}
      <DetailsModal
        data={selectedProduct}
        type="product"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Edit Product Modal */}
      <AddProductModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleUpdateProduct}
        editMode={true}
        isLoading={updating}
        initialData={
          productToEdit
            ? {
                id: productToEdit.id,
                category:
                  typeof productToEdit.category === "object" &&
                  productToEdit.category !== null
                    ? productToEdit.category._id
                    : productToEdit.category,
                name: productToEdit.name,
                des: productToEdit.des || "",
                price: productToEdit.price,
                size: productToEdit.size || "",
                qrId: productToEdit.qrId || "",
                image: productToEdit.image,
              }
            : undefined
        }
      />
      {/* Assign Modal */}
      <AssignModal
        productId={assignProductId}
        open={isAssignModalOpen}
        onOpenChange={(open) => {
          setIsAssignModalOpen(open);
          if (!open) setAssignProductId(null);
        }}
        onAssigned={() => {
          refetch();
        }}
      />
    </div>
  );
}
