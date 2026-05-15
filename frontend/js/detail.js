// ===== detail.js — Chi tiết phiếu nhập kho =====
const API = '/api/phieu-nhap';
let receiptId = null;

function formatMoney(a) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a || 0);
}
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideOut 0.4s ease forwards'; setTimeout(() => t.remove(), 400); }, 3000);
}

function getIdFromUrl() {
  const p = window.location.pathname.split('/');
  return parseInt(p[p.length - 1]);
}

async function loadDetail() {
  receiptId = getIdFromUrl();
  if (!receiptId || isNaN(receiptId)) { window.location.href = '/'; return; }
  try {
    const res = await fetch(`${API}/${receiptId}`);
    const json = await res.json();
    if (!json.success || !json.data) { showToast('Không tìm thấy phiếu', 'error'); return; }
    renderDetail(json.data);
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

function renderDetail(r) {
  document.getElementById('receiptTitle').textContent = 'Phiếu: ' + r.so_phieu;
  document.getElementById('receiptSub').textContent = 'Ngày lập: ' + formatDate(r.ngay_lap) + ' — ' + (r.ten_don_vi || '');

  const badgeMap = { nhap: 'badge-draft', da_duyet: 'badge-confirmed', da_huy: 'badge-cancelled' };
  const labelMap = { nhap: '📝 Mới nhập', da_duyet: '✅ Đã duyệt', da_huy: '❌ Đã hủy' };
  const badge = document.getElementById('statusBadge');
  badge.className = 'badge ' + (badgeMap[r.trang_thai] || '');
  badge.textContent = labelMap[r.trang_thai] || r.trang_thai;

  if (r.trang_thai === 'nhap') {
    document.getElementById('confirmBtn').style.display = '';
    document.getElementById('cancelBtn').style.display = '';
    document.getElementById('editBtn').style.display = '';
    document.getElementById('editBtn').href = '/edit/' + r.id;
  }
  document.getElementById('deleteBtn').style.display = '';

  document.getElementById('metaGrid').innerHTML =
    '<div class="meta-item"><div class="meta-label">Số phiếu</div><div class="meta-value">' + r.so_phieu + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Ngày lập</div><div class="meta-value">' + formatDate(r.ngay_lap) + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Đơn vị</div><div class="meta-value">' + (r.ten_don_vi || '—') + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Nhập tại kho</div><div class="meta-value">' + (r.nhap_tai_kho || '—') + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Nợ (TK)</div><div class="meta-value">' + (r.no || '—') + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Có (TK)</div><div class="meta-value">' + (r.co || '—') + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Số chứng từ</div><div class="meta-value">' + (r.chung_tu_so || '—') + '</div></div>' +
    '<div class="meta-item"><div class="meta-label">Ngày chứng từ</div><div class="meta-value">' + (r.ngay_chung_tu ? formatDate(r.ngay_chung_tu) : '—') + '</div></div>';

  var tbody = document.getElementById('itemsBody');
  var items = r.chi_tiet || [];
  tbody.innerHTML = items.map(function(item, i) {
    return '<tr>' +
      '<td style="text-align:center">' + (item.stt || i + 1) + '</td>' +
      '<td>' + (item.ten_hang || '—') + '</td>' +
      '<td>' + (item.ma_so || '—') + '</td>' +
      '<td>' + (item.don_vi_tinh || '—') + '</td>' +
      '<td style="text-align:right">' + new Intl.NumberFormat('vi-VN').format(item.so_luong_chung_tu || 0) + '</td>' +
      '<td style="text-align:right;font-weight:600">' + new Intl.NumberFormat('vi-VN').format(item.so_luong_thuc_nhap || 0) + '</td>' +
      '<td class="amount">' + formatMoney(item.don_gia) + '</td>' +
      '<td class="amount">' + formatMoney(item.thanh_tien) + '</td>' +
      '</tr>';
  }).join('');

  document.getElementById('totalAmount').textContent = formatMoney(r.tong_so_tien);

  if (r.tong_so_tien_chu || r.so_chung_tu_goc) {
    document.getElementById('summaryCard').style.display = '';
    document.getElementById('tongTienChu').textContent = r.tong_so_tien_chu || '—';
    document.getElementById('soChungTuGoc').textContent = r.so_chung_tu_goc || '—';
  }

  document.getElementById('signatureCard').style.display = '';
  document.getElementById('sigNguoiLap').textContent = r.nguoi_lap || '—';
  document.getElementById('sigNguoiGiao').textContent = r.nguoi_giao || '—';
  document.getElementById('sigThuKho').textContent = r.thu_kho || '—';
  document.getElementById('sigKeToan').textContent = r.ke_toan || '—';
}

async function updateTrangThai(tt) {
  var label = tt === 'da_duyet' ? 'duyệt' : 'hủy';
  if (!confirm('Bạn có chắc muốn ' + label + ' phiếu này?')) return;
  try {
    var res = await fetch(API + '/' + receiptId + '/trang-thai', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trang_thai: tt }),
    });
    var json = await res.json();
    if (json.success) { showToast('Đã ' + label + ' phiếu!'); setTimeout(loadDetail, 1000); }
    else showToast(json.message, 'error');
  } catch (err) { showToast('Lỗi: ' + err.message, 'error'); }
}

async function deleteReceipt() {
  if (!confirm('Bạn có chắc muốn xóa phiếu này?')) return;
  try {
    var res = await fetch(API + '/' + receiptId, { method: 'DELETE' });
    var json = await res.json();
    if (json.success) { showToast('Đã xóa!'); setTimeout(function() { window.location.href = '/'; }, 1500); }
    else showToast(json.message, 'error');
  } catch (err) { showToast('Lỗi: ' + err.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadDetail);
