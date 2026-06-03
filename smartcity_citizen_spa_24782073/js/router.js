function ensureLoginContainer() {
    let loginContainer = document.getElementById('loginContainer');
    if (!loginContainer) {
        loginContainer = document.createElement('div');
        loginContainer.id = 'loginContainer';
        loginContainer.style.cssText = 'position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 2rem; background: rgba(255,255,255,0.95); z-index: 1050;';
        document.body.appendChild(loginContainer);
    }
    return loginContainer;
}

function renderLoginFormMarkup() {
    return `
        <div class="card shadow-lg border-0 rounded-4" style="width: min(100%, 420px);">
            <div class="card-body p-5">
                <div class="text-center mb-4">
                    <div class="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center" style="width: 72px; height: 72px;">
                        <i class="bi bi-shield-lock fs-2" style="color: #0066ff;"></i>
                    </div>
                </div>
                <h4 class="text-center fw-bold mb-2">Portal Warga</h4>
                <p class="text-center text-muted small mb-4">Smart City Tracker - Login Citizen</p>
                <form id="loginForm">
                    <div class="mb-3 text-start">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="Username" required>
                    </div>
                    <div class="mb-4 text-start">
                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 fw-bold py-2">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
                    </button>
                </form>
                <div id="loginError" class="alert alert-danger mt-3 d-none" role="alert"></div>
            </div>
        </div>
    `;
}

// Navigasi Routing Halaman Berdasarkan Hash URL
function handleRouting() {
    const hash = window.location.hash || '#login';
    const appContent = document.getElementById('app-content');
    const loginContainer = ensureLoginContainer();

    if (hash === '#login') {
        if (appContent) appContent.style.display = 'none';
        loginContainer.innerHTML = renderLoginFormMarkup();
        loginContainer.style.display = 'flex';
        if (typeof setupLoginForm === 'function') {
            setupLoginForm();
        }
        return;
    }

    if (hash === '#dashboard') {
        loginContainer.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
        if (typeof setupDashboard === 'function') {
            setupDashboard();
        }
        return;
    }

    // Default fallback
    window.location.hash = '#login';
}

// Handle login form submission
async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await requestAPI('/api/token/', 'POST', {
            username: username,
            password: password,
        });
        
        if (response && response.status === 200) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            console.log('[Auth] ✓ Login berhasil untuk', username);
            window.location.hash = '#dashboard';
        } else {
            errorDiv.classList.remove('d-none');
            errorDiv.textContent = '❌ Login gagal! Periksa username dan password.';
        }
    } catch (error) {
        console.error('[Auth] Login error:', error);
        errorDiv.classList.remove('d-none');
        errorDiv.textContent = '❌ Terjadi kesalahan saat login';
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
    const toggle = document.getElementById('btnDarkModeToggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('spa-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    toggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('spa-theme', isDark ? 'dark' : 'light');
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
    body.dark-theme { background-color: #121212 !important; color: #e4e6eb !important; }
    body.dark-theme .card,
    body.dark-theme .modal-content { background-color: #1e1e1e !important; border-color: #2e2e2e !important; color: #ffffff !important; }
    body.dark-theme .bg-light,
    body.dark-theme .side-stat-box { background-color: #2b2b2b !important; color: #ffffff !important; }
    body.dark-theme .text-muted,
    body.dark-theme .text-secondary { color: #a9afb8 !important; }
    body.dark-theme .card-title-text,
    body.dark-theme .card-desc-text { color: #ffffff !important; }
    body.dark-theme input,
    body.dark-theme select,
    body.dark-theme textarea { background-color: #2a2a2a !important; color: #ffffff !important; border-color: #3e3e3e !important; }
    body.dark-theme input:focus,
    body.dark-theme select:focus,
    body.dark-theme textarea:focus { background-color: #333333 !important; color: #ffffff !important; }
    body.dark-theme .nav-pills .nav-link:not(.active) { color: #a9afb8 !important; }
    body.dark-theme .btn-close { filter: invert(1) brightness(2); }
    body.dark-theme .btn-outline-secondary { border-color: rgba(255,255,255,0.25) !important; color: #f8f9fa !important; }
    body.dark-theme .btn-outline-secondary:hover { background-color: rgba(255,255,255,0.08) !important; }

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

// Call initial routing on page load
handleRouting();

// Pemicu Event Listener Utama Saat Halaman Dimuat
window.addEventListener('hashchange', handleRouting);