export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: string | { _id: string; name: string };
  price: number | string;
  size: number;
  date?: string;
  time?: string;
  createdAt?: string;
  updatedAt?: string;
  image: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  purchases: number;
  address: string;
}

export interface ProductFormData {
  category: string;
  name: string;
  description: string;
  price: string;
  image?: File;
}

export interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductFormData, productId?: string) => void;
  editMode?: boolean;
  isLoading?: boolean;
  initialData?: {
    id: string;
    category: string;
    categoryId?: string;
    name: string;
    description?: string;
    price: number | string;
    image?: string;
  };
}

export interface DetailsModalProps {
  data: Product | Customer | null;
  type: "product" | "customer";
  isOpen: boolean;
  onClose: () => void;
}

export interface ProductTableProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export interface OrderItem {
  productId: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  id?: string;
  user: string | null;
  items: OrderItem[];
  totalAmount: number;
  status: "delivered" | "canceled" | "pending" | "processing";
  createdAt: string;
  updatedAt: string;
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  subtitle?: string;
  className?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  image: File | null;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  verified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedCustomer {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  purchases?: number;
  address?: string;
  productId: string;
}
