import { NguoiDungModel } from '../models/nguoiDung.model';
import pool from '../config/db';

// Mock module kết nối database để không thao tác lên database thật khi test
jest.mock('../config/db', () => {
  return {
    query: jest.fn(),
    on: jest.fn(),
  };
});

describe('NguoiDungModel Unit Tests', () => {
  afterEach(() => {
    // Xóa các dữ liệu mock sau mỗi test case
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      // Dữ liệu giả lập (mock data)
      const mockUsers = [
        { id: 1, ho_ten: 'Nguyen Van A', chuc_vu: 'Kho' },
        { id: 2, ho_ten: 'Tran Thi B', chuc_vu: 'Ke toan' }
      ];
      
      // Giả lập (mock) hàm query trả về mảng user
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockUsers });

      // Gọi hàm cần test
      const result = await NguoiDungModel.findAll();
      
      // Kiểm tra xem query có đúng câu SQL không
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nguoi_dung ORDER BY id ASC');
      // Kiểm tra xem kết quả có bằng mock data không
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return a user when found by ID', async () => {
      const mockUser = { id: 1, ho_ten: 'Nguyen Van A', chuc_vu: 'Kho' };
      
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await NguoiDungModel.findById(1);
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nguoi_dung WHERE id = $1', [1]);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await NguoiDungModel.findById(999);
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM nguoi_dung WHERE id = $1', [999]);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert a new user and return the user object', async () => {
      const newUserInput = {
        ho_ten: 'Le Van C',
        chuc_vu: 'Giam doc',
        so_dien_thoai: '0123456789',
        email: 'levanc@example.com'
      };

      const mockReturnedUser = { id: 3, ...newUserInput, created_at: new Date() };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReturnedUser] });

      const result = await NguoiDungModel.create(newUserInput);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO nguoi_dung (ho_ten, chuc_vu, so_dien_thoai, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [newUserInput.ho_ten, newUserInput.chuc_vu, newUserInput.so_dien_thoai, newUserInput.email]
      );
      expect(result).toEqual(mockReturnedUser);
    });
  });
});
