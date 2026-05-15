import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(' HỆ THỐNG PHIẾU NHẬP KHO');
  console.log('===========================================');
  console.log(` Server đang chạy tại: http://localhost:${PORT}`);
  console.log(` Danh sách phiếu:      http://localhost:${PORT}/`);
  console.log(` Tạo phiếu mới:        http://localhost:${PORT}/create`);
  console.log(` API:                  http://localhost:${PORT}/api/receipts`);
  console.log('===========================================');
});
