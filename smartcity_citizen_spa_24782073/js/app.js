// =============================================
// GLOBAL STATE MANAGEMENT SPA (Lab 12)
// =============================================
let currentTab = 'my_reports'; // Default tab (Poin 3)
let currentPage = 1;          // Default halaman (Poin 3)
let currentStatusFilter = null; // Filter status Rekap Status (draft/process/done)
let editingReportId = null;   // Penanda ID untuk membedakan POST/PUT (Poin 5)
let reportModalInstance = null;

// Konfigurasi Visual Indikator Status & Progress Bar (Poin 2)
const statusConfig = {
    'DRAFT':       { label: 'Draft',       color: '#e65100', bg: 'rgba(230, 81, 0, 0.12)',  progress: 15,  fill: '#ffa502' },
    'REPORTED':    { label: 'Dilaporkan',  color: '#0d47a1', bg: 'rgba(13, 71, 161, 0.12)',  progress: 35,  fill: '#2196f3' },
    'VERIFIED':    { label: 'Diverifikasi',color: '#1b5e20', bg: 'rgba(27, 94, 32, 0.12)',   progress: 55,  fill: '#4caf50' },
    'IN_PROGRESS': { label: 'Diproses',    color: '#4a148c', bg: 'rgba(74, 20, 140, 0.12)',   progress: 75,  fill: '#9c27b0' },
    'RESOLVED':    { label: 'Selesai',     color: '#00695c', bg: 'rgba(0, 105, 92, 0.12)',   progress: 100, fill: '#00c896' },
};

// =============================================
// MAIN INITIALIZER (Fungsi Pengendali Utama)
// =============================================
function setupDashboard() {
    // 1. Inisialisasi Instance Modal Bootstrap 5
    const modalEl = document.getElementById('reportModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        reportModalInstance = new bootstrap.Modal(modalEl);
    }

    // 2. Hubungkan Tombol "Laporan Baru" di Sidebar (Figure 3)
    const btnNewReport = document.getElementById('btnNewReport');
    if (btnNewReport) {
        btnNewReport.replaceWith(btnNewReport.cloneNode(true)); // Hapus penumpukan event listener lama
        document.getElementById('btnNewReport').addEventListener('click', () => {
            editingReportId = null; // Setel ke mode buat baru (POST)
            const reportForm = document.getElementById('reportForm');
            if (reportForm) reportForm.reset();
            document.getElementById('reportModalLabel').innerHTML = '<i class="bi bi-pencil-square me-2"></i>Buat Laporan Baru';
            if (reportModalInstance) reportModalInstance.show();
        });
    }

    // 3. Hubungkan Tombol Aksi "Simpan Draft" di dalam Modal Form
    const btnDraft = document.getElementById('btnDraft');
    if (btnDraft) {
        btnDraft.replaceWith(btnDraft.cloneNode(true));
        document.getElementById('btnDraft').addEventListener('click', () => submitReport('DRAFT'));
    }

    // 4. Hubungkan Tombol Aksi "Ajukan" di dalam Modal Form
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.replaceWith(btnSubmit.cloneNode(true));
        document.getElementById('btnSubmit').addEventListener('click', () => submitReport('REPORTED'));
    }

    // 5. Jalankan Proses Penarikan Data Utama
    updateStatusFilterButtons();
    loadDashboardData(currentTab, currentPage);
}

// =============================================
// NAVIGATION TAB SWITCHER (Laporan Saya vs Feed)
// =============================================
function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;
    if (tab !== 'my_reports') {
        currentStatusFilter = null;
        updateStatusFilterButtons();
    }

    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeed = document.getElementById('tabFeed');
    
    if (tabMyReports && tabFeed) {
        tabMyReports.classList.toggle('active', tab === 'my_reports');
        tabFeed.classList.toggle('active', tab === 'feed');
    }

    loadDashboardData(tab, 1);
}

function filterByStatus(filterKey) {
    if (currentStatusFilter === filterKey) {
        currentStatusFilter = null;
    } else {
        currentStatusFilter = filterKey;
    }
    currentTab = 'my_reports';
    currentPage = 1;

    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeed = document.getElementById('tabFeed');
    if (tabMyReports && tabFeed) {
        tabMyReports.classList.add('active');
        tabFeed.classList.remove('active');
    }

    updateStatusFilterButtons();
    loadDashboardData('my_reports', 1);
}

function updateStatusFilterButtons() {
    const badgeDraft = document.getElementById('badgeDraft');
    const badgeProcess = document.getElementById('badgeProcess');
    const badgeDone = document.getElementById('badgeDone');

    if (badgeDraft) {
        badgeDraft.classList.toggle('border', currentStatusFilter === 'draft');
        badgeDraft.classList.toggle('border-2', currentStatusFilter === 'draft');
        badgeDraft.classList.toggle('text-white', currentStatusFilter === 'draft');
        badgeDraft.style.backgroundColor = currentStatusFilter === 'draft' ? '#0d6efd' : '';
        badgeDraft.style.color = currentStatusFilter === 'draft' ? '#ffffff' : '';
    }
    if (badgeProcess) {
        badgeProcess.classList.toggle('border', currentStatusFilter === 'process');
        badgeProcess.classList.toggle('border-2', currentStatusFilter === 'process');
        badgeProcess.classList.toggle('text-white', currentStatusFilter === 'process');
        badgeProcess.style.backgroundColor = currentStatusFilter === 'process' ? '#0d6efd' : '';
        badgeProcess.style.color = currentStatusFilter === 'process' ? '#ffffff' : '';
    }
    if (badgeDone) {
        badgeDone.classList.toggle('border', currentStatusFilter === 'done');
        badgeDone.classList.toggle('border-2', currentStatusFilter === 'done');
        badgeDone.classList.toggle('text-white', currentStatusFilter === 'done');
        badgeDone.style.backgroundColor = currentStatusFilter === 'done' ? '#0d6efd' : '';
        badgeDone.style.color = currentStatusFilter === 'done' ? '#ffffff' : '';
    }
}


// =============================================
// FETCHING PAGINATED LIST DATA (Figure 4)
// =============================================
async function loadDashboardData(tab = currentTab, page = currentPage) {
    currentTab = tab;
    currentPage = page;

    const listContainer = document.getElementById('listContainer');
    if (listContainer) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <div class="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
                <p class="small mb-0">Menghubungkan data secure API...</p>
            </div>`;
    }

    // Memanggil REST API backend menggunakan fungsi pembawa token JWT global (requestAPI)
    let pageSize = 10;
    if (tab === 'my_reports' && currentStatusFilter) {
        pageSize = 1000;
        page = 1;
    }
    const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}&page_size=${pageSize}`, 'GET');

    // ========================================
    // ERROR HANDLING UNTUK STATUS 401/403
    // ========================================
    if (!response) {
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-wifi-off fs-2 text-danger"></i>
                    <p class="mt-2 small fw-semibold mb-0">⚠️ Gagal menghubungi Backend API</p>
                    <p class="small text-muted mb-2">Pastikan Backend Django berjalan di port 8000</p>
                    <button onclick="location.reload()" class="btn btn-sm btn-primary mt-2">
                        <i class="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                    </button>
                </div>`;
        }
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Cek 401 Unauthorized
    if (response.status === 401) {
        console.error('[Dashboard] Token invalid atau expired - redirect ke login');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-circle fs-2 text-warning"></i>
                    <p class="mt-2 small fw-semibold mb-0">❌ Sesi Anda telah berakhir (401 Unauthorized)</p>
                    <p class="small text-muted mb-2">Silakan login kembali untuk melanjutkan</p>
                    <button onclick="window.location.hash='#login'" class="btn btn-sm btn-primary mt-2">
                        <i class="bi bi-box-arrow-in-right me-1"></i>Kembali ke Login
                    </button>
                </div>`;
        }
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Cek 403 Forbidden
    if (response.status === 403) {
        console.error('[Dashboard] Akses ditolak - permission denied');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-lock-fill fs-2 text-danger"></i>
                    <p class="mt-2 small fw-semibold mb-0">❌ Akses Ditolak (403 Forbidden)</p>
                    <p class="small text-muted mb-2">Anda tidak memiliki izin untuk mengakses data ini</p>
                </div>`;
        }
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Tangani response sukses (200-299)
    if (response.ok && response.status === 200) {
        const data = await response.json();

        // --- INSTRUKSI 1 MODUL: Ekstraksi Data Terpaginasi ---
        const allReports = data.results ?? [];         // 1. Ambil array list data laporan
        const totalCount = data.count ?? 0;             // 2. Ambil total jumlah baris keseluruhan
        const totalPages = Math.ceil(totalCount / 10);  // 3. Kalkulasi total halaman pembagi 10

        let visibleReports = allReports;
        if (tab === 'my_reports' && currentStatusFilter) {
            visibleReports = allReports.filter(report => {
                if (currentStatusFilter === 'draft') return report.status === 'DRAFT';
                if (currentStatusFilter === 'process') return ['REPORTED','VERIFIED','IN_PROGRESS'].includes(report.status);
                if (currentStatusFilter === 'done') return report.status === 'RESOLVED';
                return true;
            });
        }

        // --- INSTRUKSI 2 MODUL: Pemicu Pembaruan UI ---
        renderList(visibleReports, tab);
        renderPagination(currentStatusFilter ? 1 : totalPages, page);
        loadSummaryStats(); // Sinkronisasikan angka indikator sidebar kiri
    } else {
        // Handle error responses lainnya (4xx, 5xx selain 401 & 403)
        console.error(`[Dashboard] Response error: ${response.status} ${response.statusText}`);
        const errorData = await response.json().catch(() => ({}));
        console.error('[Dashboard] Error details:', errorData);
        
        if (listContainer) {
            const errorMsg = errorData.detail || `API Error: ${response.status}`;
            listContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                    <p class="mt-2 small fw-semibold mb-0">Gagal memuat data dari API Backend</p>
                    <p class="small text-muted mb-2">Status: ${response.status} - ${errorMsg}</p>
                    <button onclick="location.reload()" class="btn btn-sm btn-outline-danger mt-2">
                        <i class="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                    </button>
                </div>`;
        }
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
    }
}

// =============================================
// MANIPULASI DOM: MERENDER KARTU ADUAN (Poin 2 & 3)
// =============================================
function renderList(reports, tab) {
    const listContainer = document.getElementById('listContainer');
    if (!listContainer) return;

    if (reports.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="p-4 bg-transparent rounded border border-secondary border-dashed text-muted">
                    <i class="bi bi-inbox fs-2 mb-2 d-block"></i>
                    <p class="small fw-semibold mb-0">Belum ada aduan warga di kategori ini.</p>
                </div>
            </div>`;
        return;
    }

    listContainer.innerHTML = reports.map(report => {
        const cfg = statusConfig[report.status] || statusConfig['REPORTED'];
        
        // Membaca field dinamis 'is_owner' dari Serializer Backend (Figure 2)
        const isOwner = report.is_owner ?? true; 
        const isDraft = report.status === 'DRAFT';

        // Hak Akses Tombol: Tombol Edit HANYA muncul jika data berstatus DRAFT dan milik sendiri
        const actionButtons = (isOwner && isDraft) ? `
            <button onclick="editDraft(${report.id})" class="btn btn-sm btn-light border fw-bold px-2 py-1" style="font-size: 0.75rem;">
                <i class="bi bi-pencil-square text-primary me-1"></i>Edit
            </button>
        ` : '';

        // Aturan Privasi Tab: Di tab Feed Kota, nama disamarkan secara anonim
        const reporterDisplay = (tab === 'feed') ? 'Warga Anonim' : (report.reporter_name ?? 'Saya');

        return `
            <div class="col-12">
                <div class="card p-3 border shadow-sm item-report-card">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="fw-bold mb-1 card-title-text">${report.title}</h6>
                            <div class="text-muted extra-small" style="font-size: 0.8rem;">
                                <i class="bi bi-geo-alt me-1"></i>${report.location}
                                &nbsp;•&nbsp;
                                <i class="bi bi-tag me-1"></i>${report.category}
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge text-uppercase" style="background:${cfg.bg}; color:${cfg.color}; font-size:0.7rem; font-weight:700; padding: 4px 8px;">
                                ${cfg.label}
                            </span>
                            ${actionButtons}
                        </div>
                    </div>
                    <p class="small text-secondary mb-3 card-desc-text" style="line-height: 1.5;">${report.description}</p>
                    <div class="d-flex justify-content-between align-items-center text-muted border-top pt-2" style="font-size: 0.75rem; border-color: rgba(0,0,0,0.04) !important;">
                        <span><i class="bi bi-person me-1"></i>Pelapor: <strong>${reporterDisplay}</strong></span>
                        <span><i class="bi bi-clock me-1"></i>${new Date(report.updated_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div class="progress mt-2" style="height: 5px; background-color: rgba(0,0,0,0.05);">
                        <div class="progress-bar" role="progressbar" style="width: ${cfg.progress}%; background-color: ${cfg.fill};" aria-valuenow="${cfg.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// =============================================
// RENDERING TOMBOL PAGINASI (KONTROL HALAMAN)
// =============================================
function renderPagination(totalPages, currentPg) {
    const container = document.getElementById('paginationContainer');
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button onclick="loadDashboardData('${currentTab}', ${i})"
                class="btn btn-sm ${i === currentPg ? 'btn-primary' : 'btn-light border'} fw-bold px-3">
                ${i}
            </button>
        `;
    }
    container.innerHTML = html;
}

// =============================================
// KALKULASI REKAP COUNTER SIDEBAR BYPASS PAGINATION (Poin 4)
// =============================================
async function loadSummaryStats() {
    // Membuka parameter limit besar (page_size=1000) khusus agar data filter tidak terpotong halaman
    const response = await requestAPI('/api/report/?tab=my_reports&page_size=1000', 'GET');
    
    if (response && response.status === 200) {
        const data = await response.json();
        const reports = data.results ?? [];

        // Menggunakan trik .filter().length sesuai instruksi modul
        const draft   = reports.filter(r => r.status === 'DRAFT').length;
        const process = reports.filter(r => ['REPORTED','VERIFIED','IN_PROGRESS'].includes(r.status)).length;
        const done    = reports.filter(r => r.status === 'RESOLVED').length;

        const badgeDraft   = document.getElementById('badgeDraft');
        const badgeProcess = document.getElementById('badgeProcess');
        const badgeDone    = document.getElementById('badgeDone');

        if (badgeDraft)   badgeDraft.textContent   = draft;
        if (badgeProcess) badgeProcess.textContent = process;
        if (badgeDone)    badgeDone.textContent     = done;
    }
    updateStatusFilterButtons();
}

// =============================================
// EDIT DRAFT AUTO-FILL DATA MENGGUNAKAN ID (Poin 5)
// =============================================
async function editDraft(id) {
    const response = await requestAPI(`/api/report/${id}/`, 'GET');
    
    if (response && response.status === 200) {
        const report = await response.json();

        // Menyuntikkan value data lama ke dalam form input modal
        document.getElementById('fieldTitle').value       = report.title;
        document.getElementById('fieldCategory').value    = report.category;
        document.getElementById('fieldDescription').value = report.description;
        document.getElementById('fieldLocation').value    = report.location;

        editingReportId = id; // Isi state global dengan id data yang diedit
        document.getElementById('reportModalLabel').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Draft Laporan';

        if (reportModalInstance) reportModalInstance.show();
    }
}

// =============================================
// MANAJEMEN PENGIRIMAN DATA FORMULIR (POST / PUT) (Poin 5)
// =============================================
async function submitReport(status) {
    const title       = document.getElementById('fieldTitle').value.trim();
    const category    = document.getElementById('fieldCategory').value.trim();
    const description = document.getElementById('fieldDescription').value.trim();
    const location    = document.getElementById('fieldLocation').value.trim();

    if (!title || !category || !description || !location) {
        alert('Seluruh kolom input formulir aduan wajib diisi!');
        return;
    }

    const payload = { title, category, description, location, status };
    
    // Penentuan Metode HTTP secara dinamis berbasis state editingReportId
    const method   = editingReportId ? 'PUT' : 'POST';
    const endpoint = editingReportId ? `/api/report/${editingReportId}/` : '/api/report/';

    const response = await requestAPI(endpoint, method, payload);

    if (response && (response.status === 201 || response.status === 200)) {
        if (reportModalInstance) reportModalInstance.hide();
        
        document.getElementById('reportForm').reset();
        editingReportId = null; // Setel kembali penanda ke posisi null
        
        // Memanggil ulang fungsi penarik data lokal tanpa memicu refresh browser penuh
        loadDashboardData(currentTab, currentPage);
    } else if (response) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || errorData?.message || JSON.stringify(errorData) || 'Tidak ada detail kesalahan.';
        const guidance = response.status === 403 ? '\nGunakan akun citizen/non-admin untuk membuat laporan.' : '';
        alert(`Gagal mengirim data laporan ke REST API.\nStatus: ${response.status} ${response.statusText}${guidance}\n${errorMessage}`);
    } else {
        alert('Gagal mengirim data laporan ke REST API. Periksa koneksi atau backend server.');
    }
}

// Note: Dark mode initialization dipindahkan ke router.js (initThemeEngine)
// Tidak perlu setupDarkMode di sini untuk menghindari duplikasi
/*
// =============================================
// REKAYASA SISTEM DARK MODE UTUH
// =============================================
function setupDarkMode() {
    const btnToggle = document.getElementById('btnDarkModeToggle');
    if (!btnToggle) return;

    if (!document.getElementById('style-dark-core')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'style-dark-core';
        styleEl.innerHTML = `
            body.dark-theme { background-color: #121212 !important; color: #e4e6eb !important; }
            body.dark-theme .card, body.dark-theme .modal-content { background-color: #1e1e1e !important; border-color: #2e2e2e !important; color: #ffffff !important; }
            body.dark-theme .bg-light, body.dark-theme .side-stat-box { background-color: #2b2b2b !important; color: #ffffff !important; }
            body.dark-theme .text-muted, body.dark-theme .text-secondary { color: #a9afb8 !important; }
            body.dark-theme .card-title-text { color: #ffffff !important; }
            body.dark-theme .card-desc-text { color: #d2d6dc !important; }
            body.dark-theme input, body.dark-theme select, body.dark-theme textarea { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #3e3e3e !important; }
            body.dark-theme input:focus, body.dark-theme select:focus, body.dark-theme textarea:focus { background-color: #333333 !important; color: #ffffff; }
            body.dark-theme .nav-pills .nav-link:not(.active) { color: #a9afb8 !important; }
            body.dark-theme .btn-close { filter: invert(1) brightness(2); }
        `;
        document.head.appendChild(styleEl);
    }

    btnToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme-mode', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme-mode') === 'dark') {
        document.body.classList.add('dark-theme');
    }
}
*/

// =============================================
// AUTHENTICATION CHECK & INITIALIZATION
// =============================================
function checkAuthenticationAndInit() {
    const token = localStorage.getItem('access_token');
    
    console.log('[App] Checking authentication on page load...');
    console.log('[App] Token exists:', !!token);
    
    // Initialize theme engine first
    if (typeof initThemeEngine === 'function') {
        initThemeEngine();
    }
    
    if (!token) {
        console.log('[App] No token found - Showing login form');
        window.location.hash = '#login';
        return;
    }
    
    console.log('[App] Token found - Loading dashboard');
    window.location.hash = '#dashboard';
}

// Inisialisasi otomatis berbasis siklus DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthenticationAndInit);
} else {
    checkAuthenticationAndInit();
}