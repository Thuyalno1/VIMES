import { HangHoaModel } from '../models/hangHoa.model';
import { IHangHoa } from '../interfaces/receipt.interface';

export class HangHoaService {
  static async getAllHangHoa(): Promise<IHangHoa[]> {
    return await HangHoaModel.findAll();
  }

  static async createHangHoa(data: Omit<IHangHoa, 'id' | 'created_at'>): Promise<IHangHoa> {
    return await HangHoaModel.create(data);
  }
}
