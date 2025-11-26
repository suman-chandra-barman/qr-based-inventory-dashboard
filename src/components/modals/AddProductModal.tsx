import type React from "react";
import { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
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
import type { ProductFormData, AddProductModalProps } from "@/types";

export function AddProductModal({
  open,
  onOpenChange,
  onSave,
  editMode = false,
  isLoading = false,
  initialData,
}: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    category: initialData?.category || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.image || null);

  const categories = ["Hat", "Mug", "Keychains", "Bag"];

  // Update form data and existing image when initialData changes
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        category: initialData.category || "",
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
      });
      setExistingImageUrl(initialData.image || null);
      setSelectedImage(null); // Clear any previously selected new image
    } else if (!editMode) {
      // Reset form when switching to add mode
      setFormData({
        category: "",
        name: "",
        description: "",
        price: "",
      });
      setExistingImageUrl(null);
      setSelectedImage(null);
    }
  }, [editMode, initialData]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        setFormData((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSave = () => {
    if (formData.category && formData.name && formData.price) {
      console.log("formData:", formData);
      onSave(formData, editMode ? initialData?.id : undefined);
      // Reset form if not in edit mode
      if (!editMode) {
        setFormData({
          category: "",
          name: "",
          description: "",
          price: "",
        });
        setSelectedImage(null);
        setExistingImageUrl(null);
      }
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: "",
      name: "",
      description: "",
      price: "",
    });
    setSelectedImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editMode ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-6 w-6 p-0"
            onClick={handleClose}
          ></Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Category */}
          <div className="space-y-2">
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Input
              placeholder="Product name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Textarea
              placeholder="Details"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px] resize-none"
            />
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

          {/* Image Upload */}
          <div className="space-y-2">
            {/* Show existing image or selected image preview - only when image exists */}
            {(selectedImage || existingImageUrl) && (
              <div className="relative mb-4 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <img
                  src={selectedImage ? URL.createObjectURL(selectedImage) : existingImageUrl || ""}
                  alt="Product preview"
                  className="w-full h-64 object-contain bg-gray-50"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 h-9 w-9 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={() => {
                    setSelectedImage(null);
                    if (!editMode) {
                      setExistingImageUrl(null);
                    }
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
                {selectedImage && (
                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    New image selected
                  </div>
                )}
              </div>
            )}
            
            {/* Upload area - always show but simplified when image exists */}
            {!(selectedImage || existingImageUrl) ? (
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center shadow-md">
                    <Upload className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Upload Product Image
                    </h3>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-base text-blue-600 hover:text-blue-700 font-medium underline">
                        Browse files
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-3">
                      Supported: JPEG, PNG, JPG, WebP
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Maximum file size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-gray-50 transition-all cursor-pointer"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label htmlFor="file-upload-change" className="cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-base text-blue-600 hover:text-blue-700 font-medium">
                    {selectedImage ? "Change Image" : "Replace Image"}
                  </span>
                  <input
                    id="file-upload-change"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12"
            disabled={
              isLoading ||
              !formData.category ||
              !formData.name ||
              !formData.price ||
              (!editMode && !selectedImage && !existingImageUrl)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {editMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              editMode ? "Update" : "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
