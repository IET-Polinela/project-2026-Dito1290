function setupDashboard() {
    const username = localStorage.getItem('username') || 'Warga';
    const appContent = document.getElementById('app-content');

    appContent.innerHTML = `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <div class="text-center mb-3">
                        <i class="bi bi-person-circle" style="font-size: 3rem; color: #0d6efd;"></i>
                        <h6 class="fw-bold mt-2">Portal Warga</h6>
                        <small class="text-muted">Smart City Tracker</small>
                    </div>
                    <button class="btn btn-primary btn-lg w-100 fw-bold mb-2">
                        <i class="bi bi-plus-circle-fill me-2"></i>Laporan Baru
                    </button>
                    <button class="btn btn-outline-danger w-100" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card border-0 p-5 shadow-sm text-center text-muted border-dashed">
                    <i class="bi bi-inbox fs-1"></i>
                    <h5 class="mt-3">Selamat Datang!</h5>
                    <p class="small">Koneksi API untuk data laporan akan diimplementasikan pada Lab 12.</p>
                </div>
            </section>

            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <h6 class="fw-bold">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>Pengumuman
                    </h6>
                    <hr>
                    <p class="small text-muted">Tidak ada pengumuman saat ini.</p>
                </div>
            </aside>
        </div>
    `;

    // Update navbar
    document.getElementById('nav-menus').innerHTML = `
        <span class="navbar-text text-white me-3">
            <i class="bi bi-person-fill me-1"></i>Warga
        </span>
        <button class="btn btn-outline-light btn-sm" onclick="logout()">
            <i class="bi bi-box-arrow-right me-1"></i>Logout
        </button>
    `;
}
