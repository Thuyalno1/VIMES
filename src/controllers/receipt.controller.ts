import { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service';
import { DonViModel } from '../models/donVi.model';
import { NguoiDungModel } from '../models/nguoiDung.model';
import { HangHoaModel } from '../models/hangHoa.model';
import { IApiResponse, IPhieuNhapKho, IDonVi, INguoiDung, IHangHoa } from '../interfaces/receipt.interface';

export class ReceiptController {
  // ===================== PHIẾU NHẬP KHO =====================

  // POST /api/phieu-nhap — Tạo phiếu nhập kho
  static async createPhieuNhap(req: Request, res: Response): Promise<void> {
    try {
      const { ngay_lap, don_vi_id, chi_tiet } = req.body;

      if (!ngay_lap || !don_vi_id) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ: ngày lập, đơn vị',
        } as IApiResponse<null>);
        return;
      }

      if (!chi_tiet || chi_tiet.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Phiếu nhập kho phải có ít nhất 1 dòng hàng',
        } as IApiResponse<null>);
        return;
      }

      const phieu = await ReceiptService.createPhieuNhap(req.body);

      res.status(201).json({
        success: true,
        message: 'Tạo phiếu nhập kho thành công!',
        data: phieu,
      } as IApiResponse<IPhieuNhapKho>);
    } catch (error: any) {
      console.error('Lỗi tạo phiếu:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // GET /api/phieu-nhap — Lấy danh sách
  static async getAllPhieuNhap(req: Request, res: Response): Promise<void> {
    try {
      const phieuList = await ReceiptService.getAllPhieuNhap();
      res.json({
        success: true,
        message: 'Lấy danh sách thành công',
        data: phieuList,
      } as IApiResponse<IPhieuNhapKho[]>);
    } catch (error: any) {
      console.error('Lỗi lấy danh sách:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // GET /api/phieu-nhap/:id — Lấy chi tiết
  static async getPhieuNhapById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID không hợp lệ' } as IApiResponse<null>);
        return;
      }

      const phieu = await ReceiptService.getPhieuNhapById(id);
      if (!phieu) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập kho' } as IApiResponse<null>);
        return;
      }

      res.json({ success: true, message: 'Lấy chi tiết thành công', data: phieu } as IApiResponse<IPhieuNhapKho>);
    } catch (error: any) {
      console.error('Lỗi lấy chi tiết:', error);
      res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message } as IApiResponse<null>);
    }
  }

  // DELETE /api/phieu-nhap/:id — Xóa phiếu
  static async deletePhieuNhap(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID không hợp lệ' } as IApiResponse<null>);
        return;
      }

      const deleted = await ReceiptService.deletePhieuNhap(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phiếu để xóa' } as IApiResponse<null>);
        return;
      }

      res.json({ success: true, message: 'Xóa phiếu nhập kho thành công!' } as IApiResponse<null>);
    } catch (error: any) {
      console.error('Lỗi xóa phiếu:', error);
      res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message } as IApiResponse<null>);
    }
  }

  // PATCH /api/phieu-nhap/:id/trang-thai — Cập nhật trạng thái
  static async updateTrangThai(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { trang_thai } = req.body;

      if (!trang_thai || !['nhap', 'da_duyet', 'da_huy'].includes(trang_thai)) {
        res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ (nhap, da_duyet, da_huy)',
        } as IApiResponse<null>);
        return;
      }

      const phieu = await ReceiptService.updateTrangThai(id, trang_thai);
      if (!phieu) {
        res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' } as IApiResponse<null>);
        return;
      }

      res.json({ success: true, message: 'Cập nhật trạng thái thành công!', data: phieu } as IApiResponse<IPhieuNhapKho>);
    } catch (error: any) {
      console.error('Lỗi cập nhật trạng thái:', error);
      res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message } as IApiResponse<null>);
    }
  }

  // ===================== DANH MỤC ĐƠN VỊ =====================

  static async getAllDonVi(req: Request, res: Response): Promise<void> {
    try {
      const data = await DonViModel.findAll();
      res.json({ success: true, message: 'OK', data } as IApiResponse<IDonVi[]>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }

  static async createDonVi(req: Request, res: Response): Promise<void> {
    try {
      const { ten_don_vi, bo_phan } = req.body;
      if (!ten_don_vi) {
        res.status(400).json({ success: false, message: 'Tên đơn vị là bắt buộc' } as IApiResponse<null>);
        return;
      }
      const data = await DonViModel.create({ ten_don_vi, bo_phan });
      res.status(201).json({ success: true, message: 'Thêm đơn vị thành công!', data } as IApiResponse<IDonVi>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }

  // ===================== DANH MỤC NGƯỜI DÙNG =====================

  static async getAllNguoiDung(req: Request, res: Response): Promise<void> {
    try {
      const data = await NguoiDungModel.findAll();
      res.json({ success: true, message: 'OK', data } as IApiResponse<INguoiDung[]>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }

  static async createNguoiDung(req: Request, res: Response): Promise<void> {
    try {
      const { ho_ten, chuc_vu, so_dien_thoai, email } = req.body;
      if (!ho_ten) {
        res.status(400).json({ success: false, message: 'Họ tên là bắt buộc' } as IApiResponse<null>);
        return;
      }
      const data = await NguoiDungModel.create({ ho_ten, chuc_vu, so_dien_thoai, email });
      res.status(201).json({ success: true, message: 'Thêm người dùng thành công!', data } as IApiResponse<INguoiDung>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }

  // ===================== DANH MỤC HÀNG HÓA =====================

  static async getAllHangHoa(req: Request, res: Response): Promise<void> {
    try {
      const data = await HangHoaModel.findAll();
      res.json({ success: true, message: 'OK', data } as IApiResponse<IHangHoa[]>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }

  static async createHangHoa(req: Request, res: Response): Promise<void> {
    try {
      const { ten_hang, nhan_hieu, quy_cach_pham_chat, ma_so, don_vi_tinh } = req.body;
      if (!ten_hang) {
        res.status(400).json({ success: false, message: 'Tên hàng hóa là bắt buộc' } as IApiResponse<null>);
        return;
      }
      const data = await HangHoaModel.create({ ten_hang, nhan_hieu, quy_cach_pham_chat, ma_so, don_vi_tinh });
      res.status(201).json({ success: true, message: 'Thêm hàng hóa thành công!', data } as IApiResponse<IHangHoa>);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as IApiResponse<null>);
    }
  }
}
