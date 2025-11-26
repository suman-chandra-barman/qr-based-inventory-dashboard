import { Plus, Loader2 } from "lucide-react";
import ProductCard from "../components/cards/ProductCard";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Pagination } from "@/components/pagination/Pagination";
import { useGetAllCategoriesQuery, useGetCategoryDetailsQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from "@/redux/api/api";
import type { Category } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const baseUrl = "http://10.10.12.25:5008";

const CategoriesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch categories from API
  const { data: categoriesData, isLoading } = useGetAllCategoriesQuery({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch category details when a category is selected
  const { data: categoryDetails, isLoading: isLoadingDetails } = useGetCategoryDetailsQuery(
    selectedCategoryId!,
    { skip: !selectedCategoryId }
  );

  // Create category mutation
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  
  // Update category mutation
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const handleEditClick = (category: Category) => {
    setEditCategoryId(category._id || category.id || null);
    setCategoryName(category.name);
    setExistingImageUrl(category.image.startsWith('http') ? category.image : `${baseUrl}${category.image}`);
    setImagePreview(null);
    setCategoryImage(null);
    setShowEditModal(true);
  };

  // Extract categories from API response
  let categories: Category[] = [];
  if (categoriesData?.data?.result && Array.isArray(categoriesData.data.result)) {
    categories = categoriesData.data.result.map((category: Category) => ({
      ...category,
      id: category._id || category.id,
    }));
  }

  const totalCount = categoriesData?.data?.meta?.total || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!categoryImage) {
      toast.error("Category image is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('image', categoryImage);

      await createCategory(formData).unwrap();
      toast.success("Category created successfully");
      setShowAddModal(false);
      setCategoryName("");
      setCategoryImage(null);
      setImagePreview(null);
    } catch (error) {
      toast.error("Failed to create category");
      console.error('Create category error:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      if (categoryImage) {
        formData.append('image', categoryImage);
      }

      await updateCategory({ id: editCategoryId, data: formData }).unwrap();
      toast.success("Category updated successfully");
      setShowEditModal(false);
      setCategoryName("");
      setCategoryImage(null);
      setImagePreview(null);
      setExistingImageUrl(null);
      setEditCategoryId(null);
    } catch (error) {
      toast.error("Failed to update category");
      console.error('Update category error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Search and Category Tabs */}
      <div className="py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-blue-600">Categories</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
          >
            Add Category <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
              image={category.image.startsWith('http') ? category.image : `${baseUrl}${category.image}`}
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

      {/* Add Category Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryImage">Category Image</Label>
              <Input
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 aspect-square w-32 bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setCategoryName("");
                  setCategoryImage(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating}
                className="bg-[#FFD700] text-[#003366] hover:bg-amber-400"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Category Name</Label>
              <Input
                id="editCategoryName"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryImage">Category Image (optional - leave empty to keep current)</Label>
              <Input
                id="editCategoryImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(imagePreview || existingImageUrl) && (
                <div className="mt-2 aspect-square w-32 bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || existingImageUrl || ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setCategoryName("");
                  setCategoryImage(null);
                  setImagePreview(null);
                  setExistingImageUrl(null);
                  setEditCategoryId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={isUpdating}
                className="bg-[#FFD700] text-[#003366] hover:bg-amber-400"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Details Modal */}
      <Dialog open={!!selectedCategoryId} onOpenChange={(open) => !open && setSelectedCategoryId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : categoryDetails?.data ? (
            <div className="space-y-4">
              <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={categoryDetails.data.image?.startsWith('http') ? categoryDetails.data.image : `${baseUrl}${categoryDetails.data.image}`}
                  alt={categoryDetails.data.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Name</p>
                  <p className="text-base font-semibold text-gray-900">{categoryDetails.data.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category ID</p>
                  <p className="text-sm text-gray-900 font-mono">{categoryDetails.data._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-base text-gray-900">
                    {new Date(categoryDetails.data.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-base text-gray-900">
                    {new Date(categoryDetails.data.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No details available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
