function setupLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    if (!loginContainer) {
        console.error('[Auth] loginContainer not found');
        return;
    }

    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('[Auth] loginForm not found');
        return;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await requestAPI('/api/token/', 'POST', {
                username: username,
                password: password,
            });

            if (response && response.status === 200) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                alert('Login berhasil! Selamat datang, ' + username);
                window.location.hash = '#dashboard';
            } else {
                const errorDiv = document.getElementById('loginError');
                if (errorDiv) {
                    errorDiv.classList.remove('d-none');
                    errorDiv.textContent = 'Login gagal! Periksa username dan password.';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) {
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'Terjadi kesalahan saat koneksi login.';
            }
        }
    });
}

function logout() {
    console.log('[Auth] Logout triggered - clearing tokens');
    
    // 1. Clear semua authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // 2. Clear dashboard state
    currentTab = 'my_reports';
    currentPage = 1;
    editingReportId = null;
    
    // 3. Hide modal jika ada
    if (reportModalInstance) {
        reportModalInstance.hide();
    }
    
    // 4. Hide dashboard elements, show login form
    console.log('[Auth] ✓ Tokens cleared, redirecting to #login');
    window.location.hash = '#login';
}

