const routes = {
    '#login': `
        <div class="row justify-content-center mt-5" style="animation: iosFadeIn 0.5s ease-out;">
            <div class="col-md-4 card ios-card p-4 text-center">
                <div class="ios-icon-wrapper mx-auto mb-3">
                    <i class="bi bi-lock-fill fs-3" style="color: #007aff !important;"></i>
                </div>
                <h4 class="fw-bold mb-1 main-text" style="letter-spacing: -0.5px;">Login Warga</h4>
                <p class="muted-text small mb-4">Portal Hub Smart City</p>
                <form id="loginForm">
                    <div class="mb-3">
                        <input type="text" id="loginUsername" class="form-control ios-input" placeholder="Username" required>
                    </div>
                    <div class="mb-4">
                        <input type="password" id="loginPassword" class="form-control ios-input" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-ios-primary w-100 fw-bold py-2.5">Masuk</button>
                </form>
            </div>
        </div>
    `,
    '#dashboard': `
        <div class="row g-4" style="animation: iosSlideUp 0.6s cubic-bezier(0.25, 1, 0.5, 1);">
            
            <aside class="col-12 col-lg-3">
                <div class="card ios-card p-4 text-center h-100 d-flex flex-column">
                    <div class="mb-3 position-relative d-inline-block mx-auto">
                        <div class="ios-avatar">
                            <i class="bi bi-person-fill" style="font-size: 3rem; color: #007aff;"></i>
                        </div>
                        <span class="ios-status-badge"></span>
                    </div>
                    <h5 class="fw-bold mb-1 main-text" style="letter-spacing: -0.5px;">Portal Warga</h5>
                    <p class="muted-text small mb-3">Smart City Tracker</p>
                    
                    <span class="badge ios-badge-success mx-auto mb-4">
                        <i class="bi bi-shield-check me-1"></i> Terautentikasi (JWT)
                    </span>
                    
                    <div class="d-grid gap-2 mt-auto">
                        <button id="btnLaporan" class="btn btn-ios-primary fw-bold py-2.5 shadow-sm" onclick="buatLaporanAnimasi()">
                            <i class="bi bi-plus-circle-fill me-2"></i><span>Laporan Baru</span>
                        </button>
                        <a href="#login" class="btn btn-ios-danger fw-bold py-2.5 text-decoration-none d-flex align-items-center justify-content-center" onclick="localStorage.clear();">
                            <i class="bi bi-box-arrow-left me-2"></i>Keluar
                        </a>
                    </div>
                </div>
            </aside>
            
            <section class="col-12 col-lg-6">
                <div class="card ios-card p-5 text-center position-relative overflow-hidden h-100 d-flex flex-column justify-content-center">
                    <div class="ios-icon-wrapper mx-auto mb-4" style="background: rgba(255, 149, 0, 0.12) !important;">
                        <i class="bi bi-envelope-open-fill fs-2" style="color: #ff9500 !important;"></i>
                    </div>
                    <h3 class="fw-bold main-text mb-2" style="letter-spacing: -0.8px;">Selamat Datang Kembali!</h3>
                    <p class="muted-text px-md-3 small mb-4" style="line-height: 1.6; font-size: 0.95rem;">
                        Halo warga Smart City. Semua sistem infrastruktur berjalan normal hari ini. Gunakan tombol di panel kiri untuk membuat aduan baru jika menemukan kendala fasilitas umum.
                    </p>
                    <div class="ios-alert d-flex align-items-center gap-3 text-start mx-auto w-100">
                        <div class="ios-alert-icon">
                            <i class="bi bi-database-fill-gear" style="color: #007aff;"></i>
                        </div>
                        <div class="small main-text">
                            Koneksi API data aduan akan diimplementasikan pada <strong style="color: #007aff;">Lab 12</strong>.
                        </div>
                    </div>
                </div>
            </section>
            
            <aside class="col-lg-3 d-none d-lg-block">
                <div class="card ios-card p-4 h-100">
                    <h6 class="fw-bold main-text mb-3 d-flex align-items-center gap-2" style="letter-spacing: -0.3px;">
                        <i class="bi bi-bell-fill" style="color: #ff3b30;"></i> Pengumuman Kota
                    </h6>
                    <div class="d-flex flex-column gap-3">
                        
                        <div class="ios-list-item" onclick="alert('Detail pengumuman fasilitas sedang dikembangkan.')">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge" style="background: rgba(0, 122, 255, 0.15); color: #007aff;">Fasilitas</span>
                                <small class="muted-text" style="font-size: 0.7rem;">Hari Ini</small>
                            </div>
                            <p class="mb-0 small fw-bold main-text">Perbaikan Pipa Air Wilayah Barat</p>
                            <small class="muted-text" style="font-size: 0.75rem;">Estimasi selesai pukul 16:00 WIB.</small>
                        </div>
                        
                        <div class="ios-list-item" onclick="alert('Detail pengumuman kegiatan sedang dikembangkan.')">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge" style="background: rgba(52, 199, 89, 0.15); color: #34c759;">Kegiatan</span>
                                <small class="muted-text" style="font-size: 0.7rem;">Esok Hari</small>
                            </div>
                            <p class="mb-0 small fw-bold main-text">Gotong Royong Digital Serentak</p>
                            <small class="muted-text" style="font-size: 0.75rem;">Pukul 08:00 WIB di Aula Kecamatan.</small>
                        </div>
                        
                    </div>
                </div>
            </aside>
        </div>
    `
};

// Navigasi Routing Halaman Berdasarkan Hash URL
function handleRouting() {
    const hash = window.location.hash || '#login';
    const appContent = document.getElementById('app-content');
    
    if (appContent) {
        appContent.innerHTML = routes[hash] || routes['#login'];
    }
    
    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }
}

// Fitur Interaktif Tambahan: Efek Animasi Loading Spinner Pada Tombol Laporan Baru
function buatLaporanAnimasi() {
    const btn = document.getElementById('btnLaporan');
    if (!btn) return;
    
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memuat Form...`;
    btn.disabled = true;

    setTimeout(() => {
        alert('Fitur Pengiriman Laporan Baru akan diimplementasikan penuh pada Lab Session 12!');
        btn.innerHTML = `<i class="bi bi-plus-circle-fill me-2"></i><span>Laporan Baru</span>`;
        btn.disabled = false;
    }, 1200);
}

// Logika Manajemen Penyimpanan & Pergantian Tema Warna Dinamis
function initThemeEngine() {
    const toggle = document.getElementById('themeToggleCheckbox');
    if (!toggle) return;

    // Mengambil memori preferensi tema terakhir warga agar saat di-refresh tidak reset kembali
    const savedTheme = localStorage.getItem('spa-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggle.checked = (savedTheme === 'dark');

    toggle.addEventListener('change', function() {
        const targetTheme = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('spa-theme', targetTheme);
    });
}

// Menyuntikkan Kumpulan Desain Aturan Gaya iOS Adaptif Premium ke Dokumen
const style = document.createElement('style');
style.innerHTML = `
    .ios-card {
        background: var(--ios-card) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid var(--ios-border) !important;
        border-radius: 24px !important;
        box-shadow: 0 10px 30px var(--shadow-color) !important;
        transition: transform 0.25s, box-shadow 0.25s, background 0.4s, border-color 0.4s;
    }
    .ios-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px var(--hover-glow) !important;
        border-color: rgba(0, 122, 255, 0.2) !important;
    }
    .main-text { color: var(--ios-text-main) !important; transition: color 0.4s; }
    .muted-text { color: var(--ios-text-muted) !important; transition: color 0.4s; }
    
    .ios-icon-wrapper {
        width: 60px; height: 60px; border-radius: 16px;
        background: rgba(0, 122, 255, 0.1);
        display: flex; align-items: center; justify-content: center;
    }
    .ios-avatar {
        width: 85px; height: 85px;
        background: rgba(0, 122, 255, 0.1);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        transition: box-shadow 0.4s, border-color 0.4s;
    }
    .ios-status-badge {
        position: absolute; bottom: 2px; right: 4px;
        width: 14px; height: 14px; background: #34c759;
        border: 3px solid var(--ios-card); border-radius: 50%;
        transition: border-color 0.4s;
    }
    .ios-input {
        background: var(--ios-input-bg) !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        color: var(--ios-text-main) !important;
        transition: background 0.4s, color 0.4s;
    }
    .ios-input::placeholder { color: var(--ios-text-muted); opacity: 0.7; }
    
    .btn-ios-primary {
        background: #007aff !important; border: none !important;
        border-radius: 12px !important; color: #fff !important; font-weight: 600 !important;
        transition: opacity 0.2s, transform 0.2s;
    }
    .btn-ios-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-ios-primary:active { transform: translateY(0); }
    
    .btn-ios-danger {
        background: rgba(255, 59, 48, 0.1) !important; border: none !important;
        border-radius: 12px !important; color: #ff3b30 !important; font-weight: 600 !important;
    }
    .ios-badge-success {
        background: rgba(52, 199, 89, 0.12) !important; color: #34c759 !important;
        padding: 6px 14px !important; border-radius: 20px !important; font-weight: 600;
    }
    .ios-alert {
        background: var(--ios-alert-bg) !important;
        border: 1px solid var(--ios-border) !important;
        border-radius: 16px !important; padding: 16px !important;
        transition: background 0.4s, border-color 0.4s;
    }
    .ios-alert-icon {
        width: 36px; height: 36px; background: rgba(0, 122, 255, 0.1);
        border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    
    .ios-list-item {
        background: var(--ios-list-item) !important;
        border-radius: 14px !important; padding: 12px 14px !important;
        transition: background 0.2s ease, transform 0.2s ease;
        cursor: pointer;
    }
    .ios-list-item:hover {
        transform: scale(1.02);
        background: rgba(0, 122, 255, 0.08) !important;
    }

    /* Peningkat Efek Tambahan Khusus untuk Suasana Malam (Dark Mode) */
    [data-theme="dark"] .ios-card {
        border: 1px solid rgba(0, 122, 255, 0.15) !important;
    }
    [data-theme="dark"] .main-text {
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }
    [data-theme="dark"] .ios-avatar {
        box-shadow: 0 0 15px rgba(0, 122, 255, 0.3);
        border: 1px solid rgba(0, 122, 255, 0.4);
    }

    @keyframes iosFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
    @keyframes iosSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);

// Pemicu Event Listener Utama Saat Halaman Dimuat
window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    initThemeEngine();
});