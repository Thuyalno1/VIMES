// ===== danh-muc.js — Quản lý danh mục =====
const API = '/api';

function showToast(msg, type = 'success') {
  var c = document.getElementById('toastContainer');
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = (type === 'success' ? '✅' : '❌') + ' ' + msg;
  c.appendChild(t);
  setTimeout(function() { t.style.animation = 'slideOut 0.4s ease forwards'; setTimeout(function() { t.remove(); }, 400); }, 3000);
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.style.display = 'none'; });
  document.getElementById('tab-' + name).style.display = '';
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.className = 'btn btn-outline btn-sm tab-btn';
  });
  btn.className = 'btn btn-primary btn-sm tab-btn active';
}

// ===== Đơn vị =====
async function loadDonVi() {
  var res = await fetch(API + '/don-vi');
  var json = await res.json();
  if (!json.success) return;
  var tbody = document.getElementById('donViBody');
  tbody.innerHTML = json.data.map(function(d) {
    return '<tr><td>' + d.id + '</td><td>' + d.ten_don_vi + '</td><td>' + (d.bo_phan || '—') + '</td></tr>';
  }).join('');
}

async function addDonVi() {
  var ten = document.getElementById('dv_ten').value.trim();
  if (!ten) { showToast('Tên đơn vị là bắt buộc', 'error'); return; }
  var res = await fetch(API + '/don-vi', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_don_vi: ten, bo_phan: document.getElementById('dv_bophan').value.trim() })
  });
  var json = await res.json();
  if (json.success) {
    showToast('Thêm đơn vị thành công!');
    document.getElementById('dv_ten').value = '';
    document.getElementById('dv_bophan').value = '';
    loadDonVi();
  } else showToast(json.message, 'error');
}

// ===== Người dùng =====
async function loadNguoiDung() {
  var res = await fetch(API + '/nguoi-dung');
  var json = await res.json();
  if (!json.success) return;
  var tbody = document.getElementById('nguoiDungBody');
  tbody.innerHTML = json.data.map(function(d) {
    return '<tr><td>' + d.id + '</td><td>' + d.ho_ten + '</td><td>' + (d.chuc_vu || '—') + '</td><td>' + (d.so_dien_thoai || '—') + '</td></tr>';
  }).join('');
}

async function addNguoiDung() {
  var ten = document.getElementById('nd_hoten').value.trim();
  if (!ten) { showToast('Họ tên là bắt buộc', 'error'); return; }
  var res = await fetch(API + '/nguoi-dung', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ho_ten: ten,
      chuc_vu: document.getElementById('nd_chucvu').value.trim(),
      so_dien_thoai: document.getElementById('nd_sdt').value.trim()
    })
  });
  var json = await res.json();
  if (json.success) {
    showToast('Thêm người dùng thành công!');
    document.getElementById('nd_hoten').value = '';
    document.getElementById('nd_chucvu').value = '';
    document.getElementById('nd_sdt').value = '';
    loadNguoiDung();
  } else showToast(json.message, 'error');
}

// ===== Hàng hóa =====
async function loadHangHoa() {
  var res = await fetch(API + '/hang-hoa');
  var json = await res.json();
  if (!json.success) return;
  var tbody = document.getElementById('hangHoaBody');
  tbody.innerHTML = json.data.map(function(d) {
    return '<tr><td>' + d.id + '</td><td>' + d.ten_hang + '</td><td>' + (d.ma_so || '—') + '</td><td>' + (d.don_vi_tinh || '—') + '</td></tr>';
  }).join('');
}

async function addHangHoa() {
  var ten = document.getElementById('hh_ten').value.trim();
  if (!ten) { showToast('Tên hàng hóa là bắt buộc', 'error'); return; }
  var res = await fetch(API + '/hang-hoa', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ten_hang: ten,
      ma_so: document.getElementById('hh_maso').value.trim(),
      don_vi_tinh: document.getElementById('hh_dvt').value.trim()
    })
  });
  var json = await res.json();
  if (json.success) {
    showToast('Thêm hàng hóa thành công!');
    document.getElementById('hh_ten').value = '';
    document.getElementById('hh_maso').value = '';
    document.getElementById('hh_dvt').value = '';
    loadHangHoa();
  } else showToast(json.message, 'error');
}

document.addEventListener('DOMContentLoaded', function() {
  loadDonVi();
  loadNguoiDung();
  loadHangHoa();
});
