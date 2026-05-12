import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller';

const router = Router();

// CRUD Routes
router.post('/', ReceiptController.create);
router.get('/', ReceiptController.getAll);
router.get('/:id', ReceiptController.getById);
router.delete('/:id', ReceiptController.delete);
router.patch('/:id/status', ReceiptController.updateStatus);

export default router;
