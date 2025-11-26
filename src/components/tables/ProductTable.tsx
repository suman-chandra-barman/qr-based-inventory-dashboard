import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { ArrowUpRight, Trash2, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "../pagination/Pagination";
import { DetailsModal } from "../modals/DetailsModal";
import { AddProductModal } from "../modals/AddProductModal";
import { useGetAllProductsQuery, useDeleteProductMutation, useUpdateProductMutation } from "@/redux/api/api";
import type { Product, ProductTableProps } from "@/types";

export function ProductTable({
  selectedCategory,
  onCategoryChange,
}: ProductTableProps) {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 8;

  // Fetch products from API
  const { data: productsData, isLoading, refetch } = useGetAllProductsQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  // Debug: Log the API response
  // console.log('Products API Response:', productsData);
  // console.log('Full Response Structure:', JSON.stringify(productsData, null, 2));

  // Extract data from API response - backend returns { success, message, data: {...} }
  let products = [];
  
  if (productsData?.data) {
    const dataObj = productsData.data;
    // Check different possible locations for the products array
    let rawProducts = [];
    if (Array.isArray(dataObj.data)) {
      rawProducts = dataObj.data;
    } else if (Array.isArray(dataObj.products)) {
      rawProducts = dataObj.products;
    } else if (Array.isArray(dataObj.result)) {
      rawProducts = dataObj.result;
    } else {
      console.error('Products array not found in:', dataObj);
      rawProducts = [];
    }
    
    // Map _id to id for frontend compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products = rawProducts.map((product: any) => ({
      ...product,
      id: product._id || product.id,
    }));
  }

  const totalPages = productsData?.data?.meta?.totalPages || productsData?.data?.pagination?.totalPages || 1;
  
  // Calculate categories from products if not provided by API
  const categories = productsData?.data?.categories || products.reduce((acc: Record<string, number>, product: Product) => {
    const categoryName = typeof product.category === 'object' && product.category !== null 
      ? product.category.name 
      : (product.category || 'Uncategorized');
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    setCurrentPage(1);
    setSelectedProducts([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((product: Product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      // Delete products one by one
      await Promise.all(
        selectedProducts.map((id) => deleteProduct(id).unwrap())
      );

      toast.success(
        `Successfully deleted ${selectedProducts.length} product(s)`
      );

      setSelectedProducts([]);
      refetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete products");
    }
  };

  const handleSingleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully");
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      refetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateProduct = async (productData: any, productId?: string) => {
    if (!productId) return;
    
    try {
      // Get the original product to extract category ID
      const originalProduct = products.find((p: Product) => p.id === productId);
      
      // Convert to FormData for file upload
      const formData = new FormData();
      formData.append('name', productData.name);
      
      // Send category ID if it exists, otherwise send the category name
      if (originalProduct && typeof originalProduct.category === 'object' && originalProduct.category !== null) {
        formData.append('category', originalProduct.category._id);
      } else {
        formData.append('category', productData.category);
      }
      
      formData.append('description', productData.description || '');
      formData.append('price', productData.price.toString());
      
      // Only append image if a new file was selected
      if (productData.image && productData.image instanceof File) {
        formData.append('image', productData.image);
      }
      
      await updateProduct({ id: productId, data: formData }).unwrap();
      toast.success("Product updated successfully");
      setProductToEdit(null);
      setIsEditModalOpen(false);
      refetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product");
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

  // Set indeterminate state on checkbox
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Category tabs data
  const categoryTabs = [
    {
      key: "all",
      label: "All",
      count: Object.values(categories as Record<string, number>).reduce((sum, count) => sum + count, 0),
    },
    { key: "Hat", label: "Hat", count: categories["Hat"] || 0 },
    { key: "Mug", label: "Mug", count: categories["Mug"] || 0 },
    {
      key: "mart Keychains",
      label: "mart Keychains",
      count: categories["mart Keychains"] || 0,
    },
    { key: "Bag", label: "Bag", count: categories["Bag"] || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="bg-gray-50 rounded-lg p-1 flex gap-1 overflow-x-auto">
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
            {tab.label} ({tab.count})
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
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading products...</p>
                  </td>
                </tr>
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
                          src={product.image || "/placeholder.svg"}
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
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || '0')).toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-900">{product.size}</td>
                    <td className="p-4 text-gray-500">
                      <div>
                        <p>
                          {product.date || (product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A")}
                        </p>
                        <p className="text-sm">
                          at {product.time || (product.createdAt ? new Date(product.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A")}
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
                          onClick={() => navigate(`/assign?productId=${product.id}`)}
                          className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full px-4"
                          title="Assign product"
                        >
                          Add New Assign
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
        initialData={productToEdit ? {
          id: productToEdit.id,
          category: typeof productToEdit.category === 'object' && productToEdit.category !== null 
            ? productToEdit.category.name 
            : productToEdit.category,
          name: productToEdit.name,
          description: "",
          price: productToEdit.price,
          image: productToEdit.image,
        } : undefined}
      />
    </div>
  );
}
