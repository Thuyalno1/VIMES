import pool from '../config/db';
import { IReceiptItem } from '../interfaces/receipt.interface';

export class ReceiptItemModel {
  // Thêm nhiều dòng hàng vào phiếu nhập kho
  static async createMany(receiptId: number, items: IReceiptItem[]): Promise<IReceiptItem[]> {
    const createdItems: IReceiptItem[] = [];

    for (const item of items) {
      const query = `
        INSERT INTO receipt_items (receipt_id, product_name, product_code, unit, quantity, unit_price, total_price, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        receiptId,
        item.product_name,
        item.product_code || null,
        item.unit,
        item.quantity,
        item.unit_price,
        item.total_price,
        item.notes || null,
      ];
      const result = await pool.query(query, values);
      createdItems.push(result.rows[0]);
    }

    return createdItems;
  }

  // Lấy danh sách hàng theo receipt_id
  static async findByReceiptId(receiptId: number): Promise<IReceiptItem[]> {
    const query = `
      SELECT * FROM receipt_items 
      WHERE receipt_id = $1 
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [receiptId]);
    return result.rows;
  }

  // Xóa tất cả items theo receipt_id
  static async deleteByReceiptId(receiptId: number): Promise<void> {
    const query = `DELETE FROM receipt_items WHERE receipt_id = $1`;
    await pool.query(query, [receiptId]);
  }
}
