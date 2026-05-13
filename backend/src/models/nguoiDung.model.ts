import pool from '../config/db';
import { INguoiDung } from '../interfaces/receipt.interface';

export class NguoiDungModel {
  static async findAll(): Promise<INguoiDung[]> {
    const result = await pool.query('SELECT * FROM nguoi_dung ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id: number): Promise<INguoiDung | null> {
    const result = await pool.query('SELECT * FROM nguoi_dung WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<INguoiDung, 'id' | 'created_at'>): Promise<INguoiDung> {
    const result = await pool.query(
      'INSERT INTO nguoi_dung (ho_ten, chuc_vu, so_dien_thoai, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.ho_ten, data.chuc_vu || null, data.so_dien_thoai || null, data.email || null]
    );
    return result.rows[0];
  }
}
