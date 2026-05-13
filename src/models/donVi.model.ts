import pool from '../config/db';
import { IDonVi } from '../interfaces/receipt.interface';

export class DonViModel {
  static async findAll(): Promise<IDonVi[]> {
    const result = await pool.query('SELECT * FROM don_vi ORDER BY id ASC');
    return result.rows;
  }

  static async findById(id: number): Promise<IDonVi | null> {
    const result = await pool.query('SELECT * FROM don_vi WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IDonVi, 'id' | 'created_at'>): Promise<IDonVi> {
    const result = await pool.query(
      'INSERT INTO don_vi (ten_don_vi, bo_phan) VALUES ($1, $2) RETURNING *',
      [data.ten_don_vi, data.bo_phan || null]
    );
    return result.rows[0];
  }
}
