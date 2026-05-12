import { ReceiptModel } from '../models/receipt.model';
import { ReceiptItemModel } from '../models/receiptItem.model';
import { ICreateReceiptRequest, IWarehouseReceipt } from '../interfaces/receipt.interface';
import pool from '../config/db';

export class ReceiptService {
  // Tạo phiếu nhập kho mới (với transaction)
  static async createReceipt(data: ICreateReceiptRequest): Promise<IWarehouseReceipt> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Tạo mã phiếu tự động
      const receiptNumber = await ReceiptModel.generateReceiptNumber();

      // 2. Tính tổng tiền
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      // 3. Tạo phiếu nhập kho
      const receipt = await ReceiptModel.create({
        receipt_number: receiptNumber,
        receipt_date: data.receipt_date,
        supplier_name: data.supplier_name,
        warehouse_name: data.warehouse_name,
        deliver_person: data.deliver_person,
        receiver_person: data.receiver_person,
        notes: data.notes,
        total_amount: totalAmount,
        status: 'draft',
      });

      // 4. Tạo các dòng hàng
      const itemsWithTotal = data.items.map((item) => ({
        ...item,
        total_price: item.quantity * item.unit_price,
      }));

      const createdItems = await ReceiptItemModel.createMany(receipt.id!, itemsWithTotal);

      await client.query('COMMIT');

      return { ...receipt, items: createdItems, total_amount: totalAmount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Lấy danh sách phiếu nhập kho
  static async getAllReceipts(): Promise<IWarehouseReceipt[]> {
    return await ReceiptModel.findAll();
  }

  // Lấy chi tiết phiếu nhập kho
  static async getReceiptById(id: number): Promise<IWarehouseReceipt | null> {
    const receipt = await ReceiptModel.findById(id);
    if (!receipt) return null;

    const items = await ReceiptItemModel.findByReceiptId(id);
    return { ...receipt, items };
  }

  // Xóa phiếu nhập kho
  static async deleteReceipt(id: number): Promise<boolean> {
    return await ReceiptModel.delete(id);
  }

  // Cập nhật trạng thái phiếu
  static async updateReceiptStatus(id: number, status: string): Promise<IWarehouseReceipt | null> {
    await ReceiptModel.updateStatus(id, status);
    return await this.getReceiptById(id);
  }
}
