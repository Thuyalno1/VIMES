// ===== create.js — Tạo phiếu nhập kho (Mẫu 01-VT) =====
const API = '/api';
let rowCount = 0;
let hangHoaList = [];

function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOut 0.4s ease forwards'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// Load danh mục
async function loadDanhMuc() {
  try {
    // Load đơn vị
    const dvRes = await fetch(`${API}/don-vi`);
    const dvJson = await dvRes.json();
    if (dvJson.success) {
      const select = document.getElementById('donViId');
      dvJson.data.forEach(dv => {
        const opt = document.createElement('option');
        opt.value = dv.id;
        opt.textContent = `${dv.ten_don_vi}${dv.bo_phan ? ' - ' + dv.bo_phan : ''}`;
        select.appendChild(opt);
      });
    }

    // Load người dùng
    const ndRes = await fetch(`${API}/nguoi-dung`);
    const ndJson = await ndRes.json();
    if (ndJson.success) {
      const selects = ['nguoiLapId', 'nguoiGiaoId', 'thuKhoId', 'keToanId'];
      selects.forEach(selId => {
        const select = document.getElementById(selId);
        ndJson.data.forEach(nd => {
          const opt = document.createElement('option');
          opt.value = nd.id;
          opt.textContent = `${nd.ho_ten}${nd.chuc_vu ? ' (' + nd.chuc_vu + ')' : ''}`;
          select.appendChild(opt);
        });
      });
    }

    // Load hàng hóa
    const hhRes = await fetch(`${API}/hang-hoa`);
    const hhJson = await hhRes.json();
    if (hhJson.success) {
      hangHoaList = hhJson.data;
    }
  } catch (err) {
    showToast('Lỗi tải danh mục: ' + err.message, 'error');
  }
}

// Tạo options cho select hàng hóa
function getHangHoaOptions() {
  return `<option value="">-- Chọn hàng hóa --</option>` +
    hangHoaList.map(hh => `<option value="${hh.id}" data-dvt="${hh.don_vi_tinh || ''}">${hh.ten_hang}${hh.ma_so ? ' (' + hh.ma_so + ')' : ''}</option>`).join('');
}

// Thêm dòng hàng
function addRow() {
  rowCount++;
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = `row-${rowCount}`;
  tr.innerHTML = `
    <td style="text-align:center;color:var(--text-muted)">${rowCount}</td>
    <td>
      <select class="form-control item-hanghoa" onchange="onHangHoaChange(this)">
        ${getHangHoaOptions()}
      </select>
    </td>
    <td><input type="text" class="form-control item-dvt" readonly placeholder="ĐVT" style="background:transparent"></td>
    <td><input type="number" class="form-control item-sl-ct" placeholder="0" min="0" step="any"></td>
    <td><input type="number" class="form-control item-sl-tn" placeholder="0" min="0" step="any" oninput="calcRow(this)"></td>
    <td><input type="number" class="form-control item-dongia" placeholder="0" min="0" step="any" oninput="calcRow(this)"></td>
    <td class="row-total">0 ₫</td>
    <td><button type="button" class="btn btn-ghost btn-icon" onclick="removeRow('row-${rowCount}')" title="Xóa">🗑️</button></td>
  `;
  tbody.appendChild(tr);
}

// Khi chọn hàng hóa → tự điền ĐVT
function onHangHoaChange(select) {
  const tr = select.closest('tr');
  const opt = select.options[select.selectedIndex];
  const dvt = opt.getAttribute('data-dvt') || '';
  tr.querySelector('.item-dvt').value = dvt;
}

// Xóa dòng
function removeRow(rowId) {
  document.getElementById(rowId).remove();
  reindexRows();
  calcGrandTotal();
}

function reindexRows() {
  const rows = document.querySelectorAll('#itemsBody tr');
  rows.forEach((row, i) => {
    row.querySelector('td:first-child').textContent = i + 1;
  });
}

// Tính thành tiền 1 dòng
function calcRow(input) {
  const tr = input.closest('tr');
  const qty = parseFloat(tr.querySelector('.item-sl-tn').value) || 0;
  const price = parseFloat(tr.querySelector('.item-dongia').value) || 0;
  const total = qty * price;
  tr.querySelector('.row-total').textContent = formatMoney(total);
  calcGrandTotal();
}

// Tính tổng cộng
function calcGrandTotal() {
  let grand = 0;
  document.querySelectorAll('#itemsBody tr').forEach(tr => {
    const qty = parseFloat(tr.querySelector('.item-sl-tn').value) || 0;
    const price = parseFloat(tr.querySelector('.item-dongia').value) || 0;
    grand += qty * price;
  });
  document.getElementById('grandTotal').textContent = formatMoney(grand);
}

// Thu thập dữ liệu chi tiết
function collectChiTiet() {
  const items = [];
  document.querySelectorAll('#itemsBody tr').forEach((tr, i) => {
    const hangHoaId = parseInt(tr.querySelector('.item-hanghoa').value);
    const slCt = parseFloat(tr.querySelector('.item-sl-ct').value) || 0;
    const slTn = parseFloat(tr.querySelector('.item-sl-tn').value) || 0;
    const donGia = parseFloat(tr.querySelector('.item-dongia').value) || 0;
    if (hangHoaId && slTn > 0) {
      items.push({
        hang_hoa_id: hangHoaId,
        stt: i + 1,
        so_luong_chung_tu: slCt,
        so_luong_thuc_nhap: slTn,
        don_gia: donGia,
        thanh_tien: slTn * donGia,
      });
    }
  });
  return items;
}

// Submit form
document.getElementById('receiptForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');

  const chiTiet = collectChiTiet();
  if (chiTiet.length === 0) { showToast('Vui lòng thêm ít nhất 1 dòng hàng hợp lệ', 'error'); return; }

  const donViId = parseInt(document.getElementById('donViId').value);
  const ngayLap = document.getElementById('ngayLap').value;

  if (!donViId || !ngayLap) {
    showToast('Vui lòng chọn đơn vị và ngày lập', 'error'); return;
  }

  const data = {
    ngay_lap: ngayLap,
    don_vi_id: donViId,
    no: document.getElementById('tkNo').value.trim(),
    co: document.getElementById('tkCo').value.trim(),
    nhap_tai_kho: document.getElementById('nhapTaiKho').value.trim(),
    dia_diem: document.getElementById('diaDiem').value.trim(),
    chung_tu_so: document.getElementById('chungTuSo').value.trim(),
    ngay_chung_tu: document.getElementById('ngayChungTu').value || null,
    nguoi_lap_id: parseInt(document.getElementById('nguoiLapId').value) || null,
    nguoi_giao_id: parseInt(document.getElementById('nguoiGiaoId').value) || null,
    thu_kho_id: parseInt(document.getElementById('thuKhoId').value) || null,
    ke_toan_id: parseInt(document.getElementById('keToanId').value) || null,
    tong_so_tien_chu: document.getElementById('tongSoTienChu').value.trim(),
    so_chung_tu_goc: document.getElementById('soChungTuGoc').value.trim(),
    chi_tiet: chiTiet,
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang lưu...';

  try {
    const res = await fetch(`${API}/phieu-nhap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      showToast('Tạo phiếu nhập kho thành công!');
      setTimeout(() => window.location.href = `/detail/${json.data.id}`, 1500);
    } else {
      showToast(json.message, 'error');
      btn.disabled = false; btn.innerHTML = '💾 Lưu phiếu nhập kho';
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
    btn.disabled = false; btn.innerHTML = '💾 Lưu phiếu nhập kho';
  }
});

// Init
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('ngayLap').valueAsDate = new Date();
  await loadDanhMuc();
  addRow(); // Thêm 1 dòng mặc định
});
