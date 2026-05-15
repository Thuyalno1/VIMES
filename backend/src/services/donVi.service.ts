import { DonViModel } from '../models/donVi.model';
import { IDonVi } from '../interfaces/receipt.interface';

export class DonViService {
  static async getAllDonVi(): Promise<IDonVi[]> {
    return await DonViModel.findAll();
  }

  static async createDonVi(data: Omit<IDonVi, 'id' | 'created_at'>): Promise<IDonVi> {
    return await DonViModel.create(data);
  }
}
