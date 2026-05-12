import { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service';
import { IApiResponse, IWarehouseReceipt } from '../interfaces/receipt.interface';

export class ReceiptController {
  // POST /api/receipts — Tạo phiếu nhập kho
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { receipt_date, supplier_name, warehouse_name, deliver_person, receiver_person, notes, items } = req.body;

      // Validate
      if (!receipt_date || !supplier_name || !warehouse_name) {
        res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ: ngày nhập, nhà cung cấp, kho nhập',
        } as IApiResponse<null>);
        return;
      }

      if (!items || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Phiếu nhập kho phải có ít nhất 1 dòng hàng',
        } as IApiResponse<null>);
        return;
      }

      const receipt = await ReceiptService.createReceipt({
        receipt_date,
        supplier_name,
        warehouse_name,
        deliver_person,
        receiver_person,
        notes,
        items,
      });

      res.status(201).json({
        success: true,
        message: 'Tạo phiếu nhập kho thành công!',
        data: receipt,
      } as IApiResponse<IWarehouseReceipt>);
    } catch (error: any) {
      console.error('Lỗi tạo phiếu:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // GET /api/receipts — Lấy danh sách
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const receipts = await ReceiptService.getAllReceipts();
      res.json({
        success: true,
        message: 'Lấy danh sách thành công',
        data: receipts,
      } as IApiResponse<IWarehouseReceipt[]>);
    } catch (error: any) {
      console.error('Lỗi lấy danh sách:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // GET /api/receipts/:id — Lấy chi tiết
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID không hợp lệ',
        } as IApiResponse<null>);
        return;
      }

      const receipt = await ReceiptService.getReceiptById(id);
      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiếu nhập kho',
        } as IApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Lấy chi tiết thành công',
        data: receipt,
      } as IApiResponse<IWarehouseReceipt>);
    } catch (error: any) {
      console.error('Lỗi lấy chi tiết:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // DELETE /api/receipts/:id — Xóa phiếu
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID không hợp lệ',
        } as IApiResponse<null>);
        return;
      }

      const deleted = await ReceiptService.deleteReceipt(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiếu nhập kho để xóa',
        } as IApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Xóa phiếu nhập kho thành công!',
      } as IApiResponse<null>);
    } catch (error: any) {
      console.error('Lỗi xóa phiếu:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }

  // PATCH /api/receipts/:id/status — Cập nhật trạng thái
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['draft', 'confirmed', 'cancelled'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ (draft, confirmed, cancelled)',
        } as IApiResponse<null>);
        return;
      }

      const receipt = await ReceiptService.updateReceiptStatus(id, status);
      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiếu nhập kho',
        } as IApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công!',
        data: receipt,
      } as IApiResponse<IWarehouseReceipt>);
    } catch (error: any) {
      console.error('Lỗi cập nhật trạng thái:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
      } as IApiResponse<null>);
    }
  }
}
