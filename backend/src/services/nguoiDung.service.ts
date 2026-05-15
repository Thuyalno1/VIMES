import { NguoiDungModel } from '../models/nguoiDung.model';
import { INguoiDung } from '../interfaces/receipt.interface';

export class NguoiDungService {
  static async getAllNguoiDung(): Promise<INguoiDung[]> {
    return await NguoiDungModel.findAll();
  }

  static async createNguoiDung(data: Omit<INguoiDung, 'id' | 'created_at'>): Promise<INguoiDung> {
    return await NguoiDungModel.create(data);
  }
}
