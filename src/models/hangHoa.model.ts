import pool from '../config/db';
import { IHangHoa } from '../interfaces/receipt.interface';

export class HangHoaModel {
  static async findAll(): Promise<IHangHoa[]> {
    const result = await pool.query('SELECT * FROM hang_hoa ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id: number): Promise<IHangHoa | null> {
    const result = await pool.query('SELECT * FROM hang_hoa WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IHangHoa, 'id' | 'created_at'>): Promise<IHangHoa> {
    const result = await pool.query(
      `INSERT INTO hang_hoa (ten_hang, nhan_hieu, quy_cach_pham_chat, ma_so, don_vi_tinh)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.ten_hang, data.nhan_hieu || null, data.quy_cach_pham_chat || null, data.ma_so || null, data.don_vi_tinh || null]
    );
    return result.rows[0];
  }
}
