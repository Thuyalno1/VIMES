import { HangHoaModel } from '../models/hangHoa.model';
import pool from '../config/db';

// Mock module kết nối cơ sở dữ liệu để test không phụ thuộc vào DB thật
jest.mock('../config/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

describe('HangHoaModel Unit Tests', () => {
  afterEach(() => {
    // Làm sạch các mock sau mỗi test case để tránh ảnh hưởng dữ liệu giữa các test
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of Hang Hoa', async () => {
      // 1. Chuẩn bị dữ liệu mock
      const mockData = [
        { id: 1, ten_hang: 'Bàn', nhan_hieu: 'Hòa Phát', don_vi_tinh: 'Cái' }
      ];
      // Giả lập hàm query trả về mảng dữ liệu trên
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockData });

      // 2. Thực thi hàm lấy danh sách
      const result = await HangHoaModel.findAll();
      
      // 3. Kiểm thử kết quả
      // Kiểm tra câu query SQL có được gọi đúng không
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM hang_hoa ORDER BY id ASC');
      // Kiểm tra giá trị trả về
      expect(result).toEqual(mockData);
    });
  });

  describe('findById', () => {
    it('should return Hang Hoa when found', async () => {
      // 1. Chuẩn bị mock data
      const mockData = { id: 1, ten_hang: 'Bàn', nhan_hieu: 'Hòa Phát', don_vi_tinh: 'Cái' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockData] });

      // 2. Thực thi hàm tìm kiếm theo ID
      const result = await HangHoaModel.findById(1);
      
      // 3. Kiểm thử kết quả
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM hang_hoa WHERE id = $1', [1]);
      expect(result).toEqual(mockData);
    });

    it('should return null when not found', async () => {
      // 1. Giả lập cơ sở dữ liệu trả về mảng rỗng (không tìm thấy)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      // 2. Thực thi hàm
      const result = await HangHoaModel.findById(99);
      
      // 3. Kiểm tra kết quả trả về phải là null
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert a new Hang Hoa', async () => {
      // 1. Chuẩn bị dữ liệu đầu vào và dữ liệu kết quả mock
      const input = { ten_hang: 'Bàn', nhan_hieu: 'Hòa Phát', quy_cach_pham_chat: 'Mới 100%', ma_so: 'B01', don_vi_tinh: 'Cái' };
      const mockReturned = { id: 2, ...input, created_at: new Date() };

      // Cấu hình hàm query trả về dữ liệu mock sau khi tạo
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReturned] });

      // 2. Thực thi hàm tạo
      const result = await HangHoaModel.create(input);

      // 3. Kiểm thử kết quả
      // Đảm bảo lệnh INSERT INTO được gọi với các tham số tương ứng
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO hang_hoa'),
        [input.ten_hang, input.nhan_hieu, input.quy_cach_pham_chat, input.ma_so, input.don_vi_tinh]
      );
      // Kết quả trả về phải khớp với dữ liệu mock
      expect(result).toEqual(mockReturned);
    });
  });
});
