import { Plus } from "lucide-react";
import ProductCard from "../components/cards/CategoryCard";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Pagination } from "@/components/pagination/Pagination";
import { ProductCardSkeleton } from "@/components/skeletons";
import { useGetAllCategoriesQuery } from "@/redux/api/api";
import type { Category } from "@/types";
import AddCategoryModal from "../components/modals/AddCategoryModal";
import EditCategoryModal from "../components/modals/EditCategoryModal";
import CategoryDetailsModal from "../components/modals/CategoryDetailsModal";

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

const CategoriesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch categories from API
  const { data: categoriesData, isLoading } = useGetAllCategoriesQuery({
    page: currentPage,
    limit: itemsPerPage,
  });

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Extract categories from API response
  let categories: Category[] = [];
  if (
    categoriesData?.data?.result &&
    Array.isArray(categoriesData.data.result)
  ) {
    categories = categoriesData.data.result.map((category: Category) => ({
      ...category,
      id: category._id || category.id,
    }));
  }

  const totalCount = categoriesData?.data?.meta?.total || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Categories</h1>
      {/* Search and Category Tabs */}
      <div className="pb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-blue-600">Categories</span>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <ProductCard
              key={category.id}
              id={category.id || category._id}
              name={category.name}
              price={0}
              image={
                category.image.startsWith("http")
                  ? category.image
                  : `${baseUrl}${category.image}`
              }
              onClick={() => setSelectedCategoryId(category.id || category._id)}
              onEdit={() => handleEditClick(category)}
            />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <AddCategoryModal open={showAddModal} onOpenChange={setShowAddModal} />
      <EditCategoryModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        category={selectedCategory}
      />
      <CategoryDetailsModal
        open={!!selectedCategoryId}
        onOpenChange={(open) => !open && setSelectedCategoryId(null)}
        categoryId={selectedCategoryId}
      />
    </div>
  );
};

export default CategoriesPage;
