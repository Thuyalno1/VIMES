import pool from '../config/db';
import { IPhieuNhapKho } from '../interfaces/receipt.interface';

export class PhieuNhapKhoModel {
  // Tạo phiếu nhập kho mới
  static async create(data: Partial<IPhieuNhapKho>): Promise<IPhieuNhapKho> {
    const query = `
      INSERT INTO phieu_nhap_kho (
        so_phieu, ngay_lap, no, co,
        chung_tu_so, ngay_chung_tu,
        nhap_tai_kho, dia_diem,
        tong_so_tien, tong_so_tien_chu, so_chung_tu_goc,
        trang_thai, don_vi_id,
        nguoi_lap_id, nguoi_giao_id, thu_kho_id, ke_toan_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `;
    const values = [
      data.so_phieu,
      data.ngay_lap,
      data.no || null,
      data.co || null,
      data.chung_tu_so || null,
      data.ngay_chung_tu || null,
      data.nhap_tai_kho || null,
      data.dia_diem || null,
      data.tong_so_tien || 0,
      data.tong_so_tien_chu || null,
      data.so_chung_tu_goc || null,
      data.trang_thai || 'nhap',
      data.don_vi_id,
      data.nguoi_lap_id || null,
      data.nguoi_giao_id || null,
      data.thu_kho_id || null,
      data.ke_toan_id || null,
    ];
    const result = await pool.query(query, values);
    return { ...result.rows[0], chi_tiet: [] };
  }

  // Lấy danh sách phiếu nhập kho (kèm JOIN thông tin)
  static async findAll(): Promise<IPhieuNhapKho[]> {
    const query = `
      SELECT p.*,
        d.ten_don_vi, d.bo_phan,
        lap.ho_ten AS nguoi_lap,
        giao.ho_ten AS nguoi_giao,
        kho.ho_ten AS thu_kho,
        kt.ho_ten AS ke_toan
      FROM phieu_nhap_kho p
      JOIN don_vi d ON p.don_vi_id = d.id
      LEFT JOIN nguoi_dung lap ON p.nguoi_lap_id = lap.id
      LEFT JOIN nguoi_dung giao ON p.nguoi_giao_id = giao.id
      LEFT JOIN nguoi_dung kho ON p.thu_kho_id = kho.id
      LEFT JOIN nguoi_dung kt ON p.ke_toan_id = kt.id
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map((row: any) => ({ ...row, chi_tiet: [] }));
  }

  // Lấy phiếu nhập kho theo ID (kèm JOIN)
  static async findById(id: number): Promise<IPhieuNhapKho | null> {
    const query = `
      SELECT p.*,
        d.ten_don_vi, d.bo_phan,
        lap.ho_ten AS nguoi_lap,
        giao.ho_ten AS nguoi_giao,
        kho.ho_ten AS thu_kho,
        kt.ho_ten AS ke_toan
      FROM phieu_nhap_kho p
      JOIN don_vi d ON p.don_vi_id = d.id
      LEFT JOIN nguoi_dung lap ON p.nguoi_lap_id = lap.id
      LEFT JOIN nguoi_dung giao ON p.nguoi_giao_id = giao.id
      LEFT JOIN nguoi_dung kho ON p.thu_kho_id = kho.id
      LEFT JOIN nguoi_dung kt ON p.ke_toan_id = kt.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return { ...result.rows[0], chi_tiet: [] };
  }

  // Cập nhật tổng tiền
  static async updateTotalAmount(id: number, totalAmount: number): Promise<void> {
    await pool.query(
      'UPDATE phieu_nhap_kho SET tong_so_tien = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [totalAmount, id]
    );
  }

  // Cập nhật trạng thái
  static async updateStatus(id: number, trangThai: string): Promise<void> {
    await pool.query(
      'UPDATE phieu_nhap_kho SET trang_thai = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [trangThai, id]
    );
  }

  // Xóa phiếu nhập kho
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM phieu_nhap_kho WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tạo mã phiếu tự động: PN-YYYYMMDD-XXX
  static async generateSoPhieu(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PN-${dateStr}`;

    const result = await pool.query(
      `SELECT so_phieu FROM phieu_nhap_kho WHERE so_phieu LIKE $1 ORDER BY so_phieu DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNum = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].so_phieu;
      const lastNum = parseInt(lastNumber.split('-').pop() || '0');
      nextNum = lastNum + 1;
    }

    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  }
}
