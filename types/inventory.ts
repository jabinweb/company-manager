export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  price: number;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  reorderPoint: number;
  supplier?: Supplier;
  locations: Location[];
  batchItems: BatchItem[];
}

export interface BatchItem {
  id: string;
  batchNumber: string;
  serialNumber?: string;
  quantity: number;
  expiryDate?: Date;
  location: Location;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  code: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: Supplier;
  products: Product[];
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  products: Product[];
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
}

export interface InventoryAlert {
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' | 'EXPIRED';
  product: Product;
  threshold?: number;
  currentQuantity: number;
  location?: Location;
  expiryDate?: string | Date; // Add this line
}

export interface StockTransfer {
  productId: string;
  sourceLocationId: string;
  targetLocationId: string;
  quantity: number;
  batchNumber?: string;
}
