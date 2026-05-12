import pool from '../config/db';
import { IWarehouseReceipt } from '../interfaces/receipt.interface';

export class ReceiptModel {
  // Tạo phiếu nhập kho mới
  static async create(receipt: Omit<IWarehouseReceipt, 'id' | 'items' | 'created_at' | 'updated_at'>): Promise<IWarehouseReceipt> {
    const query = `
      INSERT INTO warehouse_receipts (receipt_number, receipt_date, supplier_name, warehouse_name, deliver_person, receiver_person, notes, total_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      receipt.receipt_number,
      receipt.receipt_date,
      receipt.supplier_name,
      receipt.warehouse_name,
      receipt.deliver_person || null,
      receipt.receiver_person || null,
      receipt.notes || null,
      receipt.total_amount || 0,
      receipt.status || 'draft',
    ];
    const result = await pool.query(query, values);
    return { ...result.rows[0], items: [] };
  }

  // Lấy danh sách phiếu nhập kho
  static async findAll(): Promise<IWarehouseReceipt[]> {
    const query = `
      SELECT * FROM warehouse_receipts
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map((row: any) => ({ ...row, items: [] }));
  }

  // Lấy phiếu nhập kho theo ID
  static async findById(id: number): Promise<IWarehouseReceipt | null> {
    const query = `SELECT * FROM warehouse_receipts WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return { ...result.rows[0], items: [] };
  }

  // Cập nhật tổng tiền
  static async updateTotalAmount(id: number, totalAmount: number): Promise<void> {
    const query = `
      UPDATE warehouse_receipts 
      SET total_amount = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    await pool.query(query, [totalAmount, id]);
  }

  // Cập nhật trạng thái
  static async updateStatus(id: number, status: string): Promise<void> {
    const query = `
      UPDATE warehouse_receipts 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    await pool.query(query, [status, id]);
  }

  // Xóa phiếu nhập kho
  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM warehouse_receipts WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tạo mã phiếu tự động: NK-YYYYMMDD-XXX
  static async generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `NK-${dateStr}`;

    const query = `
      SELECT receipt_number FROM warehouse_receipts 
      WHERE receipt_number LIKE $1 
      ORDER BY receipt_number DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [`${prefix}%`]);

    let nextNum = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].receipt_number;
      const lastNum = parseInt(lastNumber.split('-').pop() || '0');
      nextNum = lastNum + 1;
    }

    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  }
}
