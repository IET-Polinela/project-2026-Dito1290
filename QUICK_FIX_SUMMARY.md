# 📋 RINGKASAN PERUBAHAN - Lab Session 12 SPA Debugging Fix

## 🎯 Masalah yang Diperbaiki
**Dashboard stuck di loading spinner** → "Menghubungkan data secure API..." (data tidak muncul)

**Root Causes:**
1. CORS configuration kurang lengkap (tidak semua origins/headers diizinkan)
2. requestAPI() tidak handle error 401/403 dengan baik
3. loadDashboardData() error handling minimal, tidak user-friendly
4. Debug logging tidak ada, sulit diagnosis masalah

---

## 🔧 FILE YANG SUDAH DIUBAH

### 1️⃣ `npm24782073_iet_2026/settings.py` (Django Configuration)

**Sebelum:**
```python
# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ Kurang aman, terlalu permissive
```

**Sesudah:**
```python
# ===== CORS Settings (Cross-Origin Resource Sharing) =====
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',  # ← Frontend port
    'http://localhost:5500',
    'http://127.0.0.1:8000',  # ← Backend port
    'http://localhost:8000',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',  # ← PENTING! Ini untuk Bearer token
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ===== JWT Configuration =====
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}
```

**Alasan Perubahan:**
- ✅ Specify origins yang diizinkan (lebih aman daripada allow all)
- ✅ Allow `Authorization` header (untuk JWT Bearer token)
- ✅ Add JWT token lifetime configuration
- ✅ Enable credentials untuk CORS

---

### 2️⃣ `smartcity_citizen_spa_24782073/js/api.js` (JavaScript API Handler)

**Sebelum:**
```javascript
const BASE_URL = 'http://127.0.0.1:8000';

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // ... minimal error handling
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        return response;
    } catch (error) {
        console.error('API Error:', error);  // ⚠️ Terlalu generic
        return null;
    }
}
```

**Sesudah:**
```javascript
async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.debug('[API] Token found in localStorage, injecting Bearer token...');
    } else {
        console.warn('[API] ⚠️ WARNING: No access_token found in localStorage!');
    }
    
    // ... detailed logging ...
    
    try {
        const response = await fetch(fullURL, options);
        
        // ✅ NEW: Handle 401 Unauthorized
        if (response.status === 401) {
            console.error('[API] ❌ 401 Unauthorized - Token Invalid/Expired');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.hash = '#login';  // Redirect ke login
            return response;
        }
        
        // ✅ NEW: Handle 403 Forbidden
        if (response.status === 403) {
            console.error('[API] ❌ 403 Forbidden - Anda tidak memiliki izin akses');
            const errorData = await response.json();
            console.error('[API] Detail error:', errorData);
            return response;
        }
        
        // ✅ NEW: Detailed logging untuk debugging
        if (response.ok) {
            console.debug(`[API] ✓ Success ${response.status}`);
        }
        
        return response;
        
    } catch (error) {
        console.error('[API] ❌ NETWORK ERROR:', error);
        alert(`Network Error: ${error.message}\nPastikan Backend Django berjalan di http://127.0.0.1:8000`);
        return null;
    }
}

// ✅ NEW: Helper functions
function isTokenValid() { /* ... */ }
function clearAuthOnError() { /* ... */ }
```

**Alasan Perubahan:**
- ✅ Handle 401: Auto-redirect ke login jika token invalid
- ✅ Handle 403: Log permission error details
- ✅ Add debug logging: Mudah lihat token status
- ✅ Better error messages: User tahu masalahnya apa
- ✅ Helper functions: Reusable auth logic

---

### 3️⃣ `smartcity_citizen_spa_24782073/js/app.js` (Dashboard Error Handling)

**Sebelum:**
```javascript
async function loadDashboardData(tab, page) {
    // ... loading spinner ...
    const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}`, 'GET');
    
    if (response && response.status === 200) {
        const data = await response.json();
        renderList(allReports, tab);
    } else {
        // ⚠️ Generic error message
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                <p class="mt-2 small fw-semibold mb-0">Gagal memuat data dari API Backend.</p>
            </div>`;
    }
}
```

**Sesudah:**
```javascript
async function loadDashboardData(tab, page) {
    // ... loading spinner ...
    const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}`, 'GET');
    
    // ✅ NEW: Handle null response (network error)
    if (!response) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-wifi-off fs-2 text-danger"></i>
                <p class="mt-2 small fw-semibold mb-0">⚠️ Gagal menghubungi Backend API</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary mt-2">
                    <i class="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                </button>
            </div>`;
        return;
    }
    
    // ✅ NEW: Handle 401 Unauthorized
    if (response.status === 401) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-circle fs-2 text-warning"></i>
                <p class="mt-2 small fw-semibold mb-0">❌ Sesi Anda telah berakhir (401 Unauthorized)</p>
                <button onclick="window.location.hash='#login'" class="btn btn-sm btn-primary mt-2">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Kembali ke Login
                </button>
            </div>`;
        return;
    }
    
    // ✅ NEW: Handle 403 Forbidden
    if (response.status === 403) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-lock-fill fs-2 text-danger"></i>
                <p class="mt-2 small fw-semibold mb-0">❌ Akses Ditolak (403 Forbidden)</p>
            </div>`;
        return;
    }
    
    // ✅ SUCCESS: Handle 200 OK
    if (response.ok && response.status === 200) {
        const data = await response.json();
        renderList(allReports, tab);
        renderPagination(totalPages, page);
    } else {
        // ✅ NEW: Generic error dengan response status detail
        const errorData = await response.json().catch(() => ({}));
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                <p class="mt-2 small fw-semibold mb-0">Gagal memuat data dari API Backend</p>
                <p class="small text-muted mb-2">Status: ${response.status} - ${errorData.detail || errorMsg}</p>
            </div>`;
    }
}
```

**Alasan Perubahan:**
- ✅ Specific error messages untuk setiap status code
- ✅ User-friendly UI (icon, button action)
- ✅ Help user solve problem (redirect ke login, retry button)
- ✅ Show status code + error detail untuk debugging

---

## ✅ TESTING STEPS

### Quick Test (2 menit)
```bash
# Terminal 1: Backend
cd /Users/user/Documents/pi/project-2026-Dito1290
source venv/bin/activate
python manage.py runserver

# Terminal 2: Frontend
cd /Users/user/Documents/pi/project-2026-Dito1290/smartcity_citizen_spa_24782073
python -m http.server 5500
```

### Browser Test
1. Buka: http://127.0.0.1:5500
2. Login dengan akun Citizen
3. Cek DevTools Console (F12) → lihat `[API]` logs
4. Lihat Dashboard → pastikan data laporan muncul (tidak stuck loading)
5. Switch tab "Laporan Saya" ↔ "Feed Kota"

### Expected Console Output
```
[API] Token found in localStorage, injecting Bearer token...
[API] GET /api/report/?tab=my_reports&page=1
[API] ✓ Success 200 {
    endpoint: "/api/report/?tab=my_reports&page=1",
    method: "GET",
    contentType: "application/json"
}
```

---

## 📝 FILES YANG DIBUAT

1. **API_DEBUGGING_GUIDE.md** - Panduan lengkap debugging API
2. **SETUP_TESTING.sh** - Script setup dan testing
3. **QUICK_FIX_SUMMARY.md** (file ini) - Ringkasan perubahan

---

## 🚀 NEXT STEPS

Setelah verify semua berjalan:

1. **Test API manually di Postman** (untuk Lab 13)
   - GET /api/report/ (list)
   - POST /api/report/ (create new)
   - PUT /api/report/{id}/ (update)
   - DELETE /api/report/{id}/ (delete)

2. **Implement Refresh Token** (untuk Lab 13)
   - Auto-refresh token jika expired
   - Handle token refresh error

3. **Add Form Validation** (untuk Lab 13)
   - Validate form sebelum submit
   - Show error messages

---

## 📞 DEBUGGING REFERENCE

**Loading stuck?**
- Buka DevTools Console (F12)
- Lihat ada `[API]` logs atau error merah?
- Paste di console: `localStorage.getItem('access_token')`

**401 Unauthorized?**
- Token belum ada: Login dulu
- Token expired: Refresh/login ulang

**403 Forbidden?**
- Bukan Citizen user: Check di Django admin
- Permission class: Review permissions.py

**CORS Error?**
- Check settings.py: CORS_ALLOWED_ORIGINS
- Restart Django: `python manage.py runserver`

