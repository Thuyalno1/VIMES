// Interface cho một dòng hàng trong phiếu nhập kho
export interface IReceiptItem {
  id?: number;
  receipt_id?: number;
  product_name: string;
  product_code?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at?: Date;
}

// Interface cho phiếu nhập kho
export interface IWarehouseReceipt {
  id?: number;
  receipt_number: string;
  receipt_date: string;
  supplier_name: string;
  warehouse_name: string;
  deliver_person?: string;
  receiver_person?: string;
  notes?: string;
  total_amount?: number;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  items: IReceiptItem[];
}

// Interface cho request tạo phiếu nhập kho
export interface ICreateReceiptRequest {
  receipt_date: string;
  supplier_name: string;
  warehouse_name: string;
  deliver_person?: string;
  receiver_person?: string;
  notes?: string;
  items: IReceiptItem[];
}

// Interface cho response API
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
