import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

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
      setExistingImageUrl(
        initialData.image
          ? `${import.meta.env.VITE_API_BASE_URL}${initialData.image}`
          : null
      );
      setImagePreview(null);
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
      setExistingImageUrl(null);
      setImagePreview(null);
    }
  }, [editMode, initialData]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: undefined }));
      setImagePreview(null);
    }
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
        setImagePreview(null);
        setExistingImageUrl(null);
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
    setImagePreview(null);
    setExistingImageUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" lg:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Label htmlFor="productCategory">Product Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger id="productCategory " className="w-full" >
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
            <Label htmlFor="productPrice">Price</Label>
            <Input
              id="productPrice"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
            />
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="productSize">Size</Label>
            <Select
              value={formData.size}
              onValueChange={(value) => handleInputChange("size", value)}
            >
              <SelectTrigger id="productSize" className="w-full" >
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
            <Label htmlFor="productQrId">QR ID</Label>
            <Input
              id="productQrId"
              placeholder="Enter unique QR ID"
              value={formData.qrId}
              onChange={(e) => handleInputChange("qrId", e.target.value)}
              disabled={editMode}
            />
          </div>

          {/* Placeholder for spacing */}
          <div></div>

          {/* Description */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="productDescription">Description</Label>
            <Textarea
              id="productDescription"
              placeholder="Write product description..."
              value={formData.des}
              onChange={(e) => handleInputChange("des", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Product Image */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="productImage">
              Product Image
              {editMode ? " (optional - leave empty to keep current)" : ""}
            </Label>
            <Input
              id="productImage"
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

          {/* Buttons */}
          <div className="flex gap-2 justify-end col-span-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#FFD700] text-[#003366] hover:bg-amber-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : editMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
