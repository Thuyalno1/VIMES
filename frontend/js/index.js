// ===== index.js — Trang danh sách phiếu nhập kho (Mẫu 01-VT) =====
const API = '/api/phieu-nhap';
let allReceipts = [];
let deleteId = null;

function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusBadge(status) {
  const map = {
    nhap: '<span class="badge badge-draft">📝 Mới nhập</span>',
    da_duyet: '<span class="badge badge-confirmed">✅ Đã duyệt</span>',
    da_huy: '<span class="badge badge-cancelled">❌ Đã hủy</span>',
  };
  return map[status] || status;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

async function loadReceipts() {
  try {
    const res = await fetch(API);
    const json = await res.json();
    if (json.success) {
      allReceipts = json.data;
      renderTable(allReceipts);
      updateStats(allReceipts);
    }
  } catch (err) {
    showToast('Không thể tải danh sách: ' + err.message, 'error');
  }
}

function renderTable(receipts) {
  const tbody = document.getElementById('receiptsBody');
  const empty = document.getElementById('emptyState');

  if (!receipts || receipts.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = receipts.map(r => `
    <tr>
      <td class="receipt-number"><a href="/detail/${r.id}" style="color:inherit;text-decoration:none">${r.so_phieu}</a></td>
      <td>${formatDate(r.ngay_lap)}</td>
      <td>${r.ten_don_vi || '—'}${r.bo_phan ? ` / ${r.bo_phan}` : ''}</td>
      <td>${r.nhap_tai_kho || '—'}</td>
      <td>${r.no || '—'} / ${r.co || '—'}</td>
      <td class="amount">${formatMoney(r.tong_so_tien)}</td>
      <td>${getStatusBadge(r.trang_thai)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <a href="/detail/${r.id}" class="btn btn-ghost btn-sm" title="Xem">👁️</a>
          <button class="btn btn-ghost btn-sm" title="Xóa" onclick="openDeleteModal(${r.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStats(receipts) {
  document.getElementById('statTotal').textContent = receipts.length;
  document.getElementById('statNhap').textContent = receipts.filter(r => r.trang_thai === 'nhap').length;
  document.getElementById('statDuyet').textContent = receipts.filter(r => r.trang_thai === 'da_duyet').length;
}

// Tìm kiếm
document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  const filtered = allReceipts.filter(r =>
    (r.so_phieu || '').toLowerCase().includes(q) ||
    (r.ten_don_vi || '').toLowerCase().includes(q) ||
    (r.nhap_tai_kho || '').toLowerCase().includes(q) ||
    (r.bo_phan || '').toLowerCase().includes(q)
  );
  renderTable(filtered);
});

// Delete modal
function openDeleteModal(id) {
  deleteId = id;
  document.getElementById('deleteModal').classList.add('show');
}
function closeDeleteModal() {
  deleteId = null;
  document.getElementById('deleteModal').classList.remove('show');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteId) return;
  try {
    const res = await fetch(`${API}/${deleteId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('Đã xóa phiếu nhập kho!');
      closeDeleteModal();
      loadReceipts();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast('Lỗi xóa: ' + err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', loadReceipts);
