export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type StockMovementType = 'IN' | 'OUT';

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    challans: number;
    followUps: number;
  };
}

export interface FollowUp {
  id: string;
  customerId: string;
  customer?: Customer;
  notes: string;
  followUpDate: string;
  status: FollowUpStatus;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number | string;
  currentStock: number;
  minimumStock: number;
  warehouseLocation?: string | null;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
  referenceId?: string | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  product?: Product;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number | string;
  quantity: number;
  totalPrice: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  totalAmount: number | string;
  status: ChallanStatus;
  notes?: string | null;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: SalesChallanItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  errors?: Array<{ field: string; message: string }>;
}
