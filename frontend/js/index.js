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
      updateStats(allReceipts);
      filterByStatus('all'); // This applies filter, renders table and sets the initial visual state
    }
  } catch (err) {
    showToast('Không thể tải danh sách: ' + err.message, 'error');
  }
}

let currentFilteredReceipts = [];
let currentPage = 1;
const itemsPerPage = 3;

function renderTablePage() {
  const tbody = document.getElementById('receiptsBody');
  const empty = document.getElementById('emptyState');
  const paginationContainer = document.getElementById('paginationContainer');

  if (!currentFilteredReceipts || currentFilteredReceipts.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    paginationContainer.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  
  const totalItems = currentFilteredReceipts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const pageItems = currentFilteredReceipts.slice(startIndex, endIndex);

  tbody.innerHTML = pageItems.map(r => `
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

  if (totalPages > 1) {
    paginationContainer.style.display = 'flex';
    document.getElementById('paginationInfo').textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${totalItems} phiếu`;
    
    let buttonsHtml = '';
    buttonsHtml += `<button class="btn btn-outline btn-sm" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
      buttonsHtml += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    buttonsHtml += `<button class="btn btn-outline btn-sm" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>`;
    
    document.getElementById('paginationControls').innerHTML = buttonsHtml;
  } else {
    paginationContainer.style.display = 'none';
  }
}

function goToPage(page) {
  currentPage = page;
  renderTablePage();
}

function updateStats(receipts) {
  document.getElementById('statTotal').textContent = receipts.length;
  document.getElementById('statNhap').textContent = receipts.filter(r => r.trang_thai === 'nhap').length;
  document.getElementById('statDuyet').textContent = receipts.filter(r => r.trang_thai === 'da_duyet').length;
}

let currentFilterStatus = 'all';

function filterByStatus(status) {
  currentFilterStatus = status;
  applyFilters();
  
  // Highlight active filter card
  document.querySelectorAll('.stat-card').forEach(card => {
    card.style.border = 'none';
  });
  const cards = document.querySelectorAll('.stat-card');
  if (status === 'all' && cards[0]) cards[0].style.border = '2px solid var(--primary)';
  else if (status === 'nhap' && cards[1]) cards[1].style.border = '2px solid var(--primary)';
  else if (status === 'da_duyet' && cards[2]) cards[2].style.border = '2px solid var(--primary)';
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const templateVal = document.getElementById('templateFilter').value;
  
  currentFilteredReceipts = allReceipts.filter(r => {
    // 1. Filter by status
    let matchesStatus = true;
    if (currentFilterStatus === 'nhap') matchesStatus = r.trang_thai === 'nhap';
    else if (currentFilterStatus === 'da_duyet') matchesStatus = r.trang_thai === 'da_duyet';
    
    // 2. Filter by template (currently all receipts in DB are assumed to be 01-VT)
    let matchesTemplate = true;
    if (templateVal !== 'all') {
      // If we later add 'mau_phieu' field, it would be checked here: r.mau_phieu === templateVal
      matchesTemplate = (templateVal === '01-VT');
    }

    // 3. Filter by search query
    let matchesSearch = true;
    if (q) {
      matchesSearch = (r.so_phieu || '').toLowerCase().includes(q) ||
        (r.ten_don_vi || '').toLowerCase().includes(q) ||
        (r.nhap_tai_kho || '').toLowerCase().includes(q) ||
        (r.bo_phan || '').toLowerCase().includes(q);
    }
    
    return matchesStatus && matchesTemplate && matchesSearch;
  });
  
  currentPage = 1; // Reset to first page whenever filters change
  renderTablePage();
}

// Events
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('templateFilter').addEventListener('change', applyFilters);

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
