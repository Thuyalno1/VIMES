import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller';

const router = Router();

// ===== Phiếu nhập kho =====
router.post('/phieu-nhap', ReceiptController.createPhieuNhap);
router.get('/phieu-nhap', ReceiptController.getAllPhieuNhap);
router.get('/phieu-nhap/:id', ReceiptController.getPhieuNhapById);
router.delete('/phieu-nhap/:id', ReceiptController.deletePhieuNhap);
router.put('/phieu-nhap/:id', ReceiptController.updatePhieuNhap);
router.patch('/phieu-nhap/:id/trang-thai', ReceiptController.updateTrangThai);

// ===== Danh mục Đơn vị =====
router.get('/don-vi', ReceiptController.getAllDonVi);
router.post('/don-vi', ReceiptController.createDonVi);

// ===== Danh mục Người dùng =====
router.get('/nguoi-dung', ReceiptController.getAllNguoiDung);
router.post('/nguoi-dung', ReceiptController.createNguoiDung);

// ===== Danh mục Hàng hóa =====
router.get('/hang-hoa', ReceiptController.getAllHangHoa);
router.post('/hang-hoa', ReceiptController.createHangHoa);

export default router;
