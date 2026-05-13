// ============================================================
// Interfaces cho Hệ thống Quản lý Tồn kho - Mẫu 01-VT
// ============================================================

// Đơn vị
export interface IDonVi {
  id?: number;
  ten_don_vi: string;
  bo_phan?: string;
  created_at?: Date;
}

// Người dùng
export interface INguoiDung {
  id?: number;
  ho_ten: string;
  chuc_vu?: string;
  so_dien_thoai?: string;
  email?: string;
  created_at?: Date;
}

// Hàng hóa
export interface IHangHoa {
  id?: number;
  ten_hang: string;
  nhan_hieu?: string;
  quy_cach_pham_chat?: string;
  ma_so?: string;
  don_vi_tinh?: string;
  created_at?: Date;
}

// Chi tiết phiếu nhập
export interface IChiTietPhieuNhap {
  id?: number;
  stt: number;
  so_luong_chung_tu?: number;
  so_luong_thuc_nhap?: number;
  don_gia?: number;
  thanh_tien?: number;
  phieu_nhap_id?: number;
  hang_hoa_id: number;
  // Joined fields
  ten_hang?: string;
  ma_so?: string;
  don_vi_tinh?: string;
  nhan_hieu?: string;
  quy_cach_pham_chat?: string;
}

// Phiếu nhập kho
export interface IPhieuNhapKho {
  id?: number;
  so_phieu: string;
  ngay_lap: string;
  no?: string;
  co?: string;
  chung_tu_so?: string;
  ngay_chung_tu?: string;
  nhap_tai_kho?: string;
  dia_diem?: string;
  tong_so_tien?: number;
  tong_so_tien_chu?: string;
  so_chung_tu_goc?: string;
  trang_thai?: string;
  don_vi_id: number;
  nguoi_lap_id?: number;
  nguoi_giao_id?: number;
  thu_kho_id?: number;
  ke_toan_id?: number;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields
  ten_don_vi?: string;
  bo_phan?: string;
  nguoi_lap?: string;
  nguoi_giao?: string;
  thu_kho?: string;
  ke_toan?: string;
  // Nested
  chi_tiet?: IChiTietPhieuNhap[];
}

// Request tạo phiếu nhập kho
export interface ICreatePhieuNhapRequest {
  ngay_lap: string;
  no?: string;
  co?: string;
  chung_tu_so?: string;
  ngay_chung_tu?: string;
  nhap_tai_kho?: string;
  dia_diem?: string;
  tong_so_tien_chu?: string;
  so_chung_tu_goc?: string;
  don_vi_id: number;
  nguoi_lap_id?: number;
  nguoi_giao_id?: number;
  thu_kho_id?: number;
  ke_toan_id?: number;
  chi_tiet: IChiTietPhieuNhap[];
}

// API Response
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
