// ========================================
// SECURE API REQUEST HANDLER (Lab 12)
// Menangani JWT Token Authorization
// ========================================
const BASE_URL = 'http://127.0.0.1:8000';

/**
 * requestAPI() - Fungsi untuk membuat request HTTP ke Backend Django REST Framework
 * @param {string} endpoint - URL endpoint (contoh: '/api/report/?tab=my_reports&page=1')
 * @param {string} method - HTTP Method (GET, POST, PUT, PATCH, DELETE)
 * @param {object} bodyData - Data body untuk POST/PUT/PATCH (opsional)
 * @returns {Promise<Response>} - Response object dari fetch
 * 
 * Fitur:
 * - Otomatis inject Bearer Token dari LocalStorage
 * - Handle CORS headers dengan benar
 * - Debugging dengan console.log untuk memudahkan diagnosis
 * - Handle 401 Unauthorized & 403 Forbidden dengan redirect ke login
 * - Handle network errors dengan proper catch
 */
async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    // 1. Ambil token dari LocalStorage (dibuat pada Lab 11 saat login)
    const token = localStorage.getItem('access_token');
    
    // 2. Set headers dengan Authorization Bearer token
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.debug('[API] Token found in localStorage, injecting Bearer token...');
    } else {
        console.warn('[API] ⚠️ WARNING: No access_token found in localStorage!');
        console.warn('[API] Pastikan Anda sudah login atau token belum kadaluarsa.');
    }

    // 3. Siapkan fetch options
    const options = {
        method: method,
        headers: headers,
    };

    if (bodyData) {
        options.body = JSON.stringify(bodyData);
    }

    // 4. Log detail request untuk debugging
    const fullURL = `${BASE_URL}${endpoint}`;
    console.debug(`[API] ${method} ${fullURL}`, {
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'NONE',
    });

    try {
        // 5. Lakukan fetch request ke backend
        const response = await fetch(fullURL, options);

        // 6. Handle error status codes
        if (response.status === 401) {
            console.error('[API] ❌ 401 Unauthorized - Token Invalid/Expired');
            console.error('[API] Mengarahkan ke halaman login...');
            
            // Hapus token yang invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // Redirect ke halaman login (sesuaikan dengan route app Anda)
            window.location.hash = '#login';
            return response;
        }

        if (response.status === 403) {
            console.error('[API] ❌ 403 Forbidden - Anda tidak memiliki izin akses');
            const errorData = await response.json();
            console.error('[API] Detail error:', errorData);
            return response;
        }

        // 7. Log successful response
        if (response.ok) {
            console.debug(`[API] ✓ Success ${response.status}`, {
                endpoint: endpoint,
                method: method,
                contentType: response.headers.get('content-type'),
            });
        } else {
            console.warn(`[API] ⚠️ Response status ${response.status} (${response.statusText})`);
        }

        return response;

    } catch (error) {
        // 8. Handle network/fetch errors
        console.error('[API] ❌ NETWORK ERROR:', error);
        console.error('[API] Error details:', {
            message: error.message,
            stack: error.stack,
            type: error.type,
        });
        
        // Show user-friendly error message
        alert(`Network Error: ${error.message}\nPastikan Backend Django berjalan di http://127.0.0.1:8000`);
        
        return null;
    }
}

// ========================================
// HELPER FUNCTION: Token Validation
// ========================================
function isTokenValid() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('[Auth] No token found in localStorage');
        return false;
    }
    
    // Simple check: verify token is not empty
    if (token.length < 20) {
        console.warn('[Auth] Token format invalid (too short)');
        return false;
    }
    
    console.debug('[Auth] Token is valid');
    return true;
}

// ========================================
// HELPER FUNCTION: Clear Auth on Error
// ========================================
function clearAuthOnError() {
    console.log('[Auth] Clearing authentication data...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
}
