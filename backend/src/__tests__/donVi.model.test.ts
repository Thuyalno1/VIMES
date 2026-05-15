import { DonViModel } from '../models/donVi.model';
import pool from '../config/db';

// Mock module kết nối cơ sở dữ liệu để không thao tác trên DB thật
jest.mock('../config/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

describe('DonViModel Unit Tests', () => {
  afterEach(() => {
    // Xóa bộ nhớ đệm của các mock sau mỗi test case để tránh ảnh hưởng chéo
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of Don Vi', async () => {
      // 1. Chuẩn bị dữ liệu giả lập (mock data)
      const mockData = [
        { id: 1, ten_don_vi: 'Công ty VIMES', bo_phan: 'Kho' }
      ];
      // Cấu hình mock hàm query để trả về mock data
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockData });

      // 2. Thực thi hàm cần kiểm thử
      const result = await DonViModel.findAll();
      
      // 3. Kiểm tra kết quả
      // Đảm bảo câu lệnh SQL đúng được gọi
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM don_vi ORDER BY id ASC');
      // Đảm bảo dữ liệu trả về khớp với mock data
      expect(result).toEqual(mockData);
    });
  });

  describe('findById', () => {
    it('should return Don Vi when found', async () => {
      // 1. Chuẩn bị dữ liệu giả lập
      const mockData = { id: 1, ten_don_vi: 'Công ty VIMES', bo_phan: 'Kho' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockData] });

      // 2. Thực thi hàm
      const result = await DonViModel.findById(1);
      
      // 3. Kiểm tra kết quả
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM don_vi WHERE id = $1', [1]);
      expect(result).toEqual(mockData);
    });

    it('should return null when not found', async () => {
      // 1. Chuẩn bị giả lập: trả về mảng rỗng (không tìm thấy)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      // 2. Thực thi hàm với một ID không tồn tại
      const result = await DonViModel.findById(99);
      
      // 3. Kiểm tra kết quả trả về phải là null
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert a new Don Vi', async () => {
      // 1. Chuẩn bị dữ liệu đầu vào và dữ liệu trả về mong muốn
      const input = { ten_don_vi: 'Công ty A', bo_phan: 'Kế toán' };
      const mockReturned = { id: 2, ...input, created_at: new Date() };

      // Cấu hình mock hàm query trả về dòng dữ liệu mới được tạo
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReturned] });

      // 2. Thực thi hàm tạo mới
      const result = await DonViModel.create(input);

      // 3. Kiểm tra xem câu lệnh INSERT đã được gọi với tham số chính xác chưa
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO don_vi (ten_don_vi, bo_phan) VALUES ($1, $2) RETURNING *',
        [input.ten_don_vi, input.bo_phan]
      );
      // Đảm bảo kết quả trả về đúng dữ liệu giả lập
      expect(result).toEqual(mockReturned);
    });
  });
});
