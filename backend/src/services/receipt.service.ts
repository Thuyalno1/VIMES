import { PhieuNhapKhoModel } from '../models/receipt.model';
import { ChiTietPhieuNhapModel } from '../models/receiptItem.model';
import { ICreatePhieuNhapRequest, IPhieuNhapKho } from '../interfaces/receipt.interface';
import pool from '../config/db';

export class ReceiptService {
  // Tạo phiếu nhập kho mới (với transaction)
  static async createPhieuNhap(data: ICreatePhieuNhapRequest): Promise<IPhieuNhapKho> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Tạo mã phiếu tự động
      const soPhieu = await PhieuNhapKhoModel.generateSoPhieu();

      // 2. Tính tổng tiền
      const tongSoTien = data.chi_tiet.reduce((sum, item) => {
        const thucNhap = item.so_luong_thuc_nhap || 0;
        const donGia = item.don_gia || 0;
        return sum + (thucNhap * donGia);
      }, 0);

      // 3. Tạo phiếu nhập kho
      const phieu = await PhieuNhapKhoModel.create({
        so_phieu: soPhieu,
        ngay_lap: data.ngay_lap,
        no: data.no,
        co: data.co,
        chung_tu_so: data.chung_tu_so,
        ngay_chung_tu: data.ngay_chung_tu,
        nhap_tai_kho: data.nhap_tai_kho,
        dia_diem: data.dia_diem,
        tong_so_tien: tongSoTien,
        tong_so_tien_chu: data.tong_so_tien_chu,
        so_chung_tu_goc: data.so_chung_tu_goc,
        trang_thai: 'nhap',
        don_vi_id: data.don_vi_id,
        nguoi_lap_id: data.nguoi_lap_id,
        nguoi_giao_id: data.nguoi_giao_id,
        thu_kho_id: data.thu_kho_id,
        ke_toan_id: data.ke_toan_id,
      });

      // 4. Tạo các dòng chi tiết (tính lại thành tiền)
      const chiTietWithTotal = data.chi_tiet.map((item, index) => ({
        ...item,
        stt: index + 1,
        thanh_tien: (item.so_luong_thuc_nhap || 0) * (item.don_gia || 0),
      }));

      const createdItems = await ChiTietPhieuNhapModel.createMany(phieu.id!, chiTietWithTotal);

      await client.query('COMMIT');

      return { ...phieu, chi_tiet: createdItems, tong_so_tien: tongSoTien };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Lấy danh sách phiếu nhập kho
  static async getAllPhieuNhap(): Promise<IPhieuNhapKho[]> {
    return await PhieuNhapKhoModel.findAll();
  }

  // Lấy chi tiết phiếu nhập kho
  static async getPhieuNhapById(id: number): Promise<IPhieuNhapKho | null> {
    const phieu = await PhieuNhapKhoModel.findById(id);
    if (!phieu) return null;

    const chiTiet = await ChiTietPhieuNhapModel.findByPhieuNhapId(id);
    return { ...phieu, chi_tiet: chiTiet };
  }

  // Xóa phiếu nhập kho
  static async deletePhieuNhap(id: number): Promise<boolean> {
    return await PhieuNhapKhoModel.delete(id);
  }

  // Cập nhật trạng thái phiếu
  static async updateTrangThai(id: number, trangThai: string): Promise<IPhieuNhapKho | null> {
    await PhieuNhapKhoModel.updateStatus(id, trangThai);
    return await this.getPhieuNhapById(id);
  }
}
