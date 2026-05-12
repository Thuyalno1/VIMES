import express from 'express';
import cors from 'cors';
import path from 'path';
import receiptRoutes from './routes/receipt.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/receipts', receiptRoutes);

// Serve Frontend (static files)
const frontendPath = path.join(__dirname, '../../frontend');
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));

// HTML Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'index.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'create.html'));
});

app.get('/detail/:id', (req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'detail.html'));
});

export default app;
