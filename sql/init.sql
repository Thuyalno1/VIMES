-- ============================================================
-- HỆ THỐNG QUẢN LÝ TỒN KHO - PHIẾU NHẬP KHO (Mẫu 01-VT)
-- PostgreSQL Version
-- ============================================================

-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS chi_tiet_phieu_nhap CASCADE;
DROP TABLE IF EXISTS phieu_nhap_kho CASCADE;
DROP TABLE IF EXISTS hang_hoa CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;
DROP TABLE IF EXISTS don_vi CASCADE;
-- Xóa bảng cũ của hệ thống trước
DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS warehouse_receipts CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ============================================================
-- BƯỚC 1A: BẢNG ĐƠN VỊ
-- Quan hệ: 1 đơn vị → nhiều phiếu nhập kho (1-N)
-- ============================================================
CREATE TABLE don_vi (
    id SERIAL PRIMARY KEY,
    ten_don_vi VARCHAR(200) NOT NULL,
    bo_phan VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BƯỚC 1B: BẢNG NGƯỜI DÙNG
-- Quan hệ: 1 người dùng → nhiều phiếu nhập kho (1-N)
-- ============================================================
CREATE TABLE nguoi_dung (
    id SERIAL PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    chuc_vu VARCHAR(100),
    so_dien_thoai VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BƯỚC 1C: BẢNG HÀNG HÓA
-- Quan hệ: N-N với PHIEU_NHAP_KHO (qua CHI_TIET_PHIEU_NHAP)
-- ============================================================
CREATE TABLE hang_hoa (
    id SERIAL PRIMARY KEY,
    ten_hang VARCHAR(200) NOT NULL,
    nhan_hieu VARCHAR(100),
    quy_cach_pham_chat VARCHAR(200),
    ma_so VARCHAR(50),
    don_vi_tinh VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BƯỚC 2: BẢNG PHIẾU NHẬP KHO
-- ============================================================
CREATE TABLE phieu_nhap_kho (
    id SERIAL PRIMARY KEY,
    -- Thông tin đầu phiếu
    so_phieu VARCHAR(50) NOT NULL UNIQUE,
    ngay_lap DATE NOT NULL,
    no VARCHAR(50),
    co VARCHAR(50),
    -- Thông tin giao nhận
    chung_tu_so VARCHAR(50),
    ngay_chung_tu DATE,
    nhap_tai_kho VARCHAR(200),
    dia_diem VARCHAR(200),
    -- Tổng kết phiếu
    tong_so_tien DECIMAL(18,2) DEFAULT 0,
    tong_so_tien_chu VARCHAR(500),
    so_chung_tu_goc VARCHAR(200),
    -- Trạng thái
    trang_thai VARCHAR(20) DEFAULT 'nhap',
    -- Khóa ngoại
    don_vi_id INT NOT NULL REFERENCES don_vi(id),
    nguoi_lap_id INT REFERENCES nguoi_dung(id),
    nguoi_giao_id INT REFERENCES nguoi_dung(id),
    thu_kho_id INT REFERENCES nguoi_dung(id),
    ke_toan_id INT REFERENCES nguoi_dung(id),
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BƯỚC 3: BẢNG CHI TIẾT PHIẾU NHẬP
-- ============================================================
CREATE TABLE chi_tiet_phieu_nhap (
    id SERIAL PRIMARY KEY,
    stt INT NOT NULL,
    so_luong_chung_tu DECIMAL(18,3),
    so_luong_thuc_nhap DECIMAL(18,3),
    don_gia DECIMAL(18,2),
    thanh_tien DECIMAL(18,2),
    -- Khóa ngoại
    phieu_nhap_id INT NOT NULL REFERENCES phieu_nhap_kho(id) ON DELETE CASCADE,
    hang_hoa_id INT NOT NULL REFERENCES hang_hoa(id)
);

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================

-- Đơn vị
INSERT INTO don_vi (ten_don_vi, bo_phan) VALUES
('Công ty VIMES', 'Phòng Kho Vận'),
('Công ty VIMES', 'Phòng Kế Toán');

-- Người dùng
INSERT INTO nguoi_dung (ho_ten, chuc_vu) VALUES
('Nguyễn Văn Minh', 'Nhân viên kế toán'),
('Trần Thị Lan', 'Nhân viên giao nhận'),
('Lê Văn Tuấn', 'Thủ kho'),
('Phạm Thị Hoa', 'Kế toán trưởng');

-- Hàng hóa
INSERT INTO hang_hoa (ten_hang, ma_so, don_vi_tinh) VALUES
('Bàn làm việc', 'BLV-001', 'cái'),
('Ghế văn phòng', 'GVP-002', 'cái'),
('Tủ tài liệu', 'TTL-003', 'cái');

-- Phiếu nhập kho
INSERT INTO phieu_nhap_kho (
    so_phieu, ngay_lap, no, co,
    chung_tu_so, ngay_chung_tu,
    nhap_tai_kho, dia_diem,
    tong_so_tien, tong_so_tien_chu,
    don_vi_id, nguoi_lap_id, nguoi_giao_id, thu_kho_id, ke_toan_id,
    trang_thai
) VALUES (
    'PN-2024-001', '2024-01-15', '152', '331',
    'HD-001', '2024-01-14',
    'Kho A', 'Tầng 1 - Tòa nhà chính',
    17000000, 'Mười bảy triệu đồng chẵn',
    1, 1, 2, 3, 4,
    'da_duyet'
);

-- Chi tiết phiếu nhập
INSERT INTO chi_tiet_phieu_nhap (
    phieu_nhap_id, hang_hoa_id, stt,
    so_luong_chung_tu, so_luong_thuc_nhap,
    don_gia, thanh_tien
) VALUES
(1, 1, 1, 10, 10, 500000, 5000000),
(1, 2, 2, 5, 5, 200000, 1000000),
(1, 3, 3, 3, 3, 1000000, 3000000);
