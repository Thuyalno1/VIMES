import pool from '../config/db';
import { IChiTietPhieuNhap } from '../interfaces/receipt.interface';

export class ChiTietPhieuNhapModel {
  // Thêm nhiều dòng chi tiết vào phiếu nhập kho
  static async createMany(phieuNhapId: number, items: IChiTietPhieuNhap[]): Promise<IChiTietPhieuNhap[]> {
    const createdItems: IChiTietPhieuNhap[] = [];

    for (const item of items) {
      const query = `
        INSERT INTO chi_tiet_phieu_nhap (
          phieu_nhap_id, hang_hoa_id, stt,
          so_luong_chung_tu, so_luong_thuc_nhap,
          don_gia, thanh_tien
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        phieuNhapId,
        item.hang_hoa_id,
        item.stt,
        item.so_luong_chung_tu || 0,
        item.so_luong_thuc_nhap || 0,
        item.don_gia || 0,
        item.thanh_tien || 0,
      ];
      const result = await pool.query(query, values);
      createdItems.push(result.rows[0]);
    }

    return createdItems;
  }

  // Lấy danh sách chi tiết theo phieu_nhap_id (kèm thông tin hàng hóa)
  static async findByPhieuNhapId(phieuNhapId: number): Promise<IChiTietPhieuNhap[]> {
    const query = `
      SELECT ct.*,
        h.ten_hang, h.ma_so, h.don_vi_tinh,
        h.nhan_hieu, h.quy_cach_pham_chat
      FROM chi_tiet_phieu_nhap ct
      JOIN hang_hoa h ON ct.hang_hoa_id = h.id
      WHERE ct.phieu_nhap_id = $1
      ORDER BY ct.stt ASC
    `;
    const result = await pool.query(query, [phieuNhapId]);
    return result.rows;
  }

  // Xóa tất cả chi tiết theo phieu_nhap_id
  static async deleteByPhieuNhapId(phieuNhapId: number): Promise<void> {
    await pool.query('DELETE FROM chi_tiet_phieu_nhap WHERE phieu_nhap_id = $1', [phieuNhapId]);
  }
}
