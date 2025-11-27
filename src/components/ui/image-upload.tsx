import React, { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  existingImageUrl?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function ImageUpload({
  onImageChange,
  existingImageUrl,
  placeholder = "Upload Image",
  accept = "image/jpeg,image/png,image/jpg,image/webp",
  maxSize = 5,
  className = "",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return false;
      }
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB.`);
        return false;
      }
      setError("");
      return true;
    },
    [maxSize]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (validateFile(file)) {
          setSelectedImage(file);
          onImageChange(file);
        }
      }
    },
    [validateFile, onImageChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
        const file = files[0];
        if (validateFile(file)) {
          setSelectedImage(file);
          onImageChange(file);
        }
      }
    },
    [validateFile, onImageChange]
  );

  const handleRemoveImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedImage(null);
      onImageChange(null);
      setError("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onImageChange]
  );

  const handleClickUpload = () => {
    inputRef.current?.click();
  };

  const currentImageUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : existingImageUrl;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-2">
        {currentImageUrl ? (
          // Image Preview Mode
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 shadow-sm">
              <img
                src={currentImageUrl}
                alt="Preview"
                className="w-full h-48 object-contain bg-gray-50"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white hover:bg-gray-100"
                  onClick={handleClickUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>

            {/* File Info */}
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {selectedImage?.name || "Existing Image"}
                  </p>
                  {selectedImage && (
                    <p className="text-xs text-green-600">
                      {formatFileSize(selectedImage.size)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Upload Mode
          <div
            className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
              dragActive
                ? "border-blue-500 bg-blue-50 scale-[1.01]"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              {/* Upload Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  dragActive ? "bg-blue-100 scale-110" : "bg-blue-50"
                } transition-all duration-200`}
              >
                {dragActive ? (
                  <Upload className="w-6 h-6 text-blue-600 animate-bounce" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                )}
              </div>

              {/* Text Content */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-gray-900">
                  {dragActive ? "Drop your image here" : placeholder}
                </h3>
                <p className="text-xs text-gray-500">
                  {dragActive
                    ? "Release to upload"
                    : "Drag and drop or click to browse"}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                    PNG
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                    JPG
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                    JPEG
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                    WebP
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 pt-0.5">
                  Max size: {maxSize}MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <X className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
