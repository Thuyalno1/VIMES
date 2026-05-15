// ===== create.js — Tạo/Sửa phiếu nhập kho (Mẫu 01-VT) =====
const API = '/api';
let rowCount = 0;
let hangHoaList = [];

const pathParts = window.location.pathname.split('/').filter(p => p);
const isEditMode = pathParts[0] === 'edit';
const receiptId = isEditMode ? parseInt(pathParts[1]) : null;

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
    const url = isEditMode ? `${API}/phieu-nhap/${receiptId}` : `${API}/phieu-nhap`;
    const method = isEditMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      showToast(isEditMode ? 'Cập nhật phiếu nhập kho thành công!' : 'Tạo phiếu nhập kho thành công!');
      setTimeout(() => window.location.href = `/detail/${json.data.id || receiptId}`, 1500);
    } else {
      showToast(json.message, 'error');
      btn.disabled = false; btn.innerHTML = '💾 Lưu phiếu nhập kho';
    }
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
    btn.disabled = false; btn.innerHTML = '💾 Lưu phiếu nhập kho';
  }
});

async function loadReceiptData(id) {
  try {
    const res = await fetch(`${API}/phieu-nhap/${id}`);
    const json = await res.json();
    if (!json.success || !json.data) {
      showToast('Không tìm thấy phiếu nhập kho!', 'error');
      return;
    }
    const data = json.data;
    
    // Fill form
    if (data.ngay_lap) document.getElementById('ngayLap').value = data.ngay_lap.split('T')[0];
    if (data.don_vi_id) document.getElementById('donViId').value = data.don_vi_id;
    if (data.no) document.getElementById('tkNo').value = data.no;
    if (data.co) document.getElementById('tkCo').value = data.co;
    if (data.nhap_tai_kho) document.getElementById('nhapTaiKho').value = data.nhap_tai_kho;
    if (data.dia_diem) document.getElementById('diaDiem').value = data.dia_diem;
    if (data.chung_tu_so) document.getElementById('chungTuSo').value = data.chung_tu_so;
    if (data.ngay_chung_tu) document.getElementById('ngayChungTu').value = data.ngay_chung_tu.split('T')[0];
    if (data.nguoi_lap_id) document.getElementById('nguoiLapId').value = data.nguoi_lap_id;
    if (data.nguoi_giao_id) document.getElementById('nguoiGiaoId').value = data.nguoi_giao_id;
    if (data.thu_kho_id) document.getElementById('thuKhoId').value = data.thu_kho_id;
    if (data.ke_toan_id) document.getElementById('keToanId').value = data.ke_toan_id;
    if (data.tong_so_tien_chu) document.getElementById('tongSoTienChu').value = data.tong_so_tien_chu;
    if (data.so_chung_tu_goc) document.getElementById('soChungTuGoc').value = data.so_chung_tu_goc;
    
    // Load chi tiết
    if (data.chi_tiet && data.chi_tiet.length > 0) {
      data.chi_tiet.forEach(item => {
        addRow();
        const tr = document.getElementById(`row-${rowCount}`);
        tr.querySelector('.item-hanghoa').value = item.hang_hoa_id;
        const opt = tr.querySelector('.item-hanghoa').options[tr.querySelector('.item-hanghoa').selectedIndex];
        if (opt) tr.querySelector('.item-dvt').value = opt.getAttribute('data-dvt') || '';
        
        tr.querySelector('.item-sl-ct').value = item.so_luong_chung_tu;
        tr.querySelector('.item-sl-tn').value = item.so_luong_thuc_nhap;
        tr.querySelector('.item-dongia').value = item.don_gia;
        calcRow(tr.querySelector('.item-sl-tn'));
      });
    } else {
      addRow();
    }
  } catch (err) {
    showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
  }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('ngayLap').valueAsDate = new Date();
  await loadDanhMuc();
  
  if (isEditMode && receiptId) {
    document.querySelector('.page-header h1').textContent = 'Sửa Phiếu Nhập Kho';
    await loadReceiptData(receiptId);
  } else {
    addRow(); // Thêm 1 dòng mặc định
  }
});
