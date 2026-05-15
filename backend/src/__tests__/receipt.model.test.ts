import { PhieuNhapKhoModel } from '../models/receipt.model';
import pool from '../config/db';

// Giả lập (mock) thư viện kết nối cơ sở dữ liệu
jest.mock('../config/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

describe('PhieuNhapKhoModel Unit Tests', () => {
  afterEach(() => {
    // Xóa bộ nhớ đệm của các hàm mock sau mỗi test case
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of Phieu Nhap Kho', async () => {
      // 1. Chuẩn bị mock data
      const mockData = [
        { id: 1, so_phieu: 'PN-20231010-001', tong_so_tien: 1000 }
      ];
      // Giả lập hàm query trả về mock data
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockData });

      // 2. Thực thi hàm cần test
      const result = await PhieuNhapKhoModel.findAll();
      
      // 3. Kiểm thử kết quả
      // Kiểm tra câu query được gọi có chứa 'SELECT p.*' không
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT p.*'));
      // Đảm bảo kết quả trả về đúng như định dạng mong đợi (có mảng chi_tiet rỗng đi kèm)
      expect(result).toEqual(mockData.map(row => ({ ...row, chi_tiet: [] })));
    });
  });

  describe('findById', () => {
    it('should return a Phieu Nhap Kho when found', async () => {
      // 1. Chuẩn bị mock data
      const mockData = { id: 1, so_phieu: 'PN-20231010-001', tong_so_tien: 1000 };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockData] });

      // 2. Thực thi hàm tìm kiếm
      const result = await PhieuNhapKhoModel.findById(1);
      
      // 3. Kiểm thử kết quả
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id = $1'), [1]);
      expect(result).toEqual({ ...mockData, chi_tiet: [] });
    });

    it('should return null when not found', async () => {
      // 1. Giả lập cơ sở dữ liệu trả về mảng rỗng
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      // 2. Thực thi hàm với ID không tồn tại
      const result = await PhieuNhapKhoModel.findById(99);
      
      // 3. Kiểm tra kết quả
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when delete is successful', async () => {
      // 1. Giả lập cơ sở dữ liệu báo cáo có 1 dòng bị ảnh hưởng (xóa thành công)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      // 2. Thực thi hàm xóa
      const result = await PhieuNhapKhoModel.delete(1);
      
      // 3. Kiểm tra kết quả
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM phieu_nhap_kho WHERE id = $1 RETURNING id', [1]);
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      // 1. Giả lập cơ sở dữ liệu báo cáo có 0 dòng bị ảnh hưởng (không tìm thấy phiếu để xóa)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 });

      // 2. Thực thi hàm xóa với ID không tồn tại
      const result = await PhieuNhapKhoModel.delete(99);
      
      // 3. Kiểm tra kết quả trả về phải là false
      expect(result).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update the status', async () => {
      // 1. Giả lập query không báo lỗi
      (pool.query as jest.Mock).mockResolvedValueOnce({});

      // 2. Thực thi hàm cập nhật trạng thái
      await PhieuNhapKhoModel.updateStatus(1, 'da_duyet');
      
      // 3. Đảm bảo câu lệnh UPDATE được thực thi với đúng các tham số: trạng thái và ID
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE phieu_nhap_kho SET trang_thai = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['da_duyet', 1]
      );
    });
  });
});
