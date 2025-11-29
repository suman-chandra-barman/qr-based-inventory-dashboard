import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUpdateCategoryMutation } from "@/redux/api/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types";

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  open,
  onOpenChange,
  category,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setExistingImageUrl(
        category.image.startsWith("http")
          ? category.image
          : `${baseUrl}${category.image}`
      );
      setImagePreview(null);
      setCategoryImage(null);
    }
  }, [category]);

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

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      if (categoryImage) {
        formData.append("image", categoryImage);
      }

      await updateCategory({
        id: category?._id || category?.id,
        data: formData,
      }).unwrap();
      toast.success("Category updated successfully");
      onOpenChange(false);
      setCategoryName("");
      setCategoryImage(null);
      setImagePreview(null);
      setExistingImageUrl(null);
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Update category error:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCategoryName("");
    setCategoryImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="editCategoryImage">
              Category Image (optional - leave empty to keep current)
            </Label>
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
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="bg-[#FFD700] text-[#003366] hover:bg-amber-400"
            >
              {isLoading ? (
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
  );
};

export default EditCategoryModal;
