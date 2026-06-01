function setupLoginForm() {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">
                <h4 class="text-center fw-bold mb-4">
                    <i class="bi bi-person-circle me-2"></i>Login Warga
                </h4>
                <form id="loginForm">
                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input type="text" id="loginUsername"
                            class="form-control" placeholder="Username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" id="loginPassword"
                            class="form-control" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 fw-bold">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
                    </button>
                </form>
                <div id="loginError" class="alert alert-danger mt-3 d-none"></div>
            </div>
        </div>
    `;

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await requestAPI('/api/token/', 'POST', {
                username: username,
                password: password,
            });

            if (response.status === 200) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                alert('Login berhasil! Selamat datang, ' + username);
                window.location.hash = '#dashboard';
            } else {
                const errorData = await response.json();
                const errorDiv = document.getElementById('loginError');
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'Login gagal! Periksa username dan password.';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.hash = '#login';
}
