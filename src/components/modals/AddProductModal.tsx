import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import type { ProductFormData, AddProductModalProps, Category } from "@/types";
import { useGetAllCategoriesQuery } from "@/redux/api/api";

export function AddProductModal({
  open,
  onOpenChange,
  onSave,
  editMode = false,
  isLoading = false,
  initialData,
}: AddProductModalProps) {
  const { data: categoriesData } = useGetAllCategoriesQuery({});
  const categories: Category[] = categoriesData?.data?.result || [];

  const [formData, setFormData] = useState<ProductFormData>({
    category: initialData?.categoryId || initialData?.category || "",
    name: initialData?.name || "",
    des: initialData?.des || "",
    price: initialData?.price?.toString() || "",
    size: initialData?.size || "",
    qrId: initialData?.qrId || "",
  });

  const sizes = ["S", "M", "L", "XL", "XXL"];

  // Update form data when initialData changes
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        category: initialData.categoryId || initialData.category || "",
        name: initialData.name || "",
        des: initialData.des || "",
        price: initialData.price?.toString() || "",
        size: initialData.size || "",
        qrId: initialData.qrId || "",
      });
    } else if (!editMode) {
      // Reset form when switching to add mode
      setFormData({
        category: "",
        name: "",
        des: "",
        price: "",
        size: "",
        qrId: "",
      });
    }
  }, [editMode, initialData]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file || undefined }));
  };

  const handleSave = () => {
    if (
      formData.category &&
      formData.name &&
      formData.des &&
      formData.price &&
      formData.size &&
      formData.qrId
    ) {
      console.log("formData:", formData);
      onSave(formData, editMode ? initialData?.id : undefined);
      // Reset form if not in edit mode
      if (!editMode) {
        setFormData({
          category: "",
          name: "",
          des: "",
          price: "",
          size: "",
          qrId: "",
        });
      }
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: "",
      name: "",
      des: "",
      price: "",
      size: "",
      qrId: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-6 w-6 p-0"
            onClick={handleClose}
          ></Button>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Input
              placeholder="Product name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Input
              placeholder="Price: $45"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Select
              value={formData.size}
              onValueChange={(value) => handleInputChange("size", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QR ID */}
          <div className="space-y-2">
            <Input
              placeholder="QR ID (8 characters)"
              value={formData.qrId}
              onChange={(e) => handleInputChange("qrId", e.target.value)}
              className="w-full"
              maxLength={8}
              disabled={editMode}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write product description..."
              value={formData.des}
              onChange={(e) => handleInputChange("des", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            onImageChange={handleImageChange}
            existingImageUrl={
              editMode && initialData?.image
                ? `${import.meta.env.VITE_API_BASE_URL}${initialData.image}`
                : undefined
            }
          />

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12"
            disabled={
              isLoading ||
              !formData.category ||
              !formData.name ||
              !formData.des ||
              !formData.price ||
              !formData.size ||
              (!editMode && !formData.qrId) ||
              (!editMode && !formData.image)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {editMode ? "Updating..." : "Saving..."}
              </>
            ) : editMode ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
