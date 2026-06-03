# 🔧 API DEBUGGING GUIDE - Lab Session 12 SPA

## 📋 Ringkasan Konfigurasi yang Sudah Diperbaiki

### ✅ A. Django Settings (CORS Configuration)
**File:** `npm24782073_iet_2026/settings.py`

```python
# CORS Settings - Izinkan komunikasi dari port 5500 ke port 8000
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',  # ← PENTING untuk JWT Token
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

**Penjelasan:**
- `CORS_ALLOWED_ORIGINS`: Whitelist domain yang boleh akses API (development: port 5500 & 8000)
- `CORS_ALLOW_CREDENTIALS`: Izinkan cookies & authorization headers
- `CORS_ALLOW_HEADERS`: Whitelist header yang boleh dikirim, termasuk `authorization` untuk Bearer token

---

### ✅ B. JavaScript requestAPI() Function
**File:** `smartcity_citizen_spa_24782073/js/api.js`

```javascript
async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    // 1. Ambil token dari LocalStorage
    const token = localStorage.getItem('access_token');
    
    // 2. Set headers dengan Bearer token
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Lakukan fetch request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: method,
        headers: headers,
        body: bodyData ? JSON.stringify(bodyData) : null,
    });

    // 4. Handle 401 Unauthorized
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.hash = '#login';
        return response;
    }

    // 5. Handle 403 Forbidden
    if (response.status === 403) {
        console.error('Access Denied');
        return response;
    }

    return response;
}
```

**Fitur Baru:**
- ✅ Debugging console.log untuk melacak request
- ✅ Auto-inject Bearer token dari localStorage
- ✅ Handle 401 error (redirect ke login)
- ✅ Handle 403 error (akses ditolak)
- ✅ Error handling untuk network issues

---

### ✅ C. App.js Error Handling
**File:** `smartcity_citizen_spa_24782073/js/app.js`

```javascript
async function loadDashboardData(tab, page) {
    // ... loading spinner ...
    
    const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}`, 'GET');

    // Cek 401 Unauthorized
    if (response.status === 401) {
        // Show: "Sesi Anda telah berakhir - Kembali ke Login"
    }

    // Cek 403 Forbidden
    if (response.status === 403) {
        // Show: "Akses Ditolak - Permission Denied"
    }

    // Sukses (200 OK)
    if (response.ok) {
        const data = await response.json();
        renderList(data.results, tab);
    }
}
```

---

## 🔍 TROUBLESHOOTING CHECKLIST

### 1️⃣ Loading Spinner Stuck - Langkah Debugging

**STEP 1: Buka DevTools Console (F12 atau Ctrl+Shift+J)**
```
Lihat ada error apa di console browser
```

**STEP 2: Cek apakah Backend Berjalan**
```bash
# Terminal 1: Cek Django running
curl -v http://127.0.0.1:8000/api/report/ -H "Authorization: Bearer YOUR_TOKEN"

# Jika 404: Endpoint tidak terdaftar
# Jika 401: Token invalid/tidak ada
# Jika 403: Permission denied
# Jika 200: OK!
```

**STEP 3: Cek Token di localStorage**
```javascript
// Paste di Console browser:
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')

// Jika null: Anda belum login, arahkan ke #login
// Jika ada tapi panjang < 20 char: Token corrupted
```

**STEP 4: Test Manual API Request**
```javascript
// Paste di Console browser setelah login:
const token = localStorage.getItem('access_token');
fetch('http://127.0.0.1:8000/api/report/?tab=my_reports', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    }
})
.then(r => {
    console.log('Status:', r.status);
    return r.json();
})
.then(data => console.log('Data:', data))
.catch(e => console.error('Error:', e));
```

---

### 2️⃣ Error 401 Unauthorized

**Penyebab:**
- Token tidak ada di localStorage (belum login)
- Token expired (umur token > 60 menit)
- Token corrupted/invalid
- Backend tidak terima Authorization header

**Solusi:**
```javascript
// A. Cek token ada atau tidak
if (!localStorage.getItem('access_token')) {
    console.log('❌ Anda belum login');
    window.location.hash = '#login';
}

// B. Cek token format
const token = localStorage.getItem('access_token');
console.log('Token dimulai dengan "eyJ":', token.startsWith('eyJ'));

// C. Refresh token jika expired
// (implementasi di Lab 13 nanti)
```

---

### 3️⃣ Error 403 Forbidden

**Penyebab:**
- User tidak punya permission (bukan Citizen)
- Bukan owner saat edit/delete report
- Permission class di backend menolak

**Cek di Backend:**
```python
# main_app/permissions.py
class IsCitizen(permissions.BasePermission):
    def has_permission(self, request, view):
        # Pastikan user authenticated
        return request.user and request.user.is_authenticated
```

---

### 4️⃣ CORS Error (Browser Console)

**Error Message:**
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/report/' 
from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
```

**Solusi:**
Pastikan di `settings.py` sudah ada:
```python
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',  # ← Frontend port
    'http://127.0.0.1:8000',  # ← Backend port
]
```

Dan jalankan migrations jika ada perubahan settings:
```bash
python manage.py migrate
```

---

## 📡 Testing API Endpoint Manual

### Test 1: GET Reports (Public)
```bash
# Terminal: Test tanpa login (tidak perlu token)
curl -v http://127.0.0.1:8000/api/report/

# Hasil:
# 200 OK: Endpoint bekerja, tapi data kosong (belum ada laporan)
# 401 Unauthorized: Backend hanya izinkan authenticated users
# 404 Not Found: Endpoint tidak terdaftar di urls.py
```

### Test 2: GET Reports (With Token)
```bash
# Setelah login, ambil token dari localStorage
TOKEN="your_access_token_here"

curl -v http://127.0.0.1:8000/api/report/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Hasil:
# 200 OK + JSON array: Sukses!
# 401 Unauthorized: Token invalid/expired
# 403 Forbidden: Permission denied
```

### Test 3: POST New Report
```bash
TOKEN="your_access_token_here"

curl -X POST http://127.0.0.1:8000/api/report/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Jalan Rusak",
    "category": "Infrastruktur",
    "description": "Jalan depan rumah rusak parah",
    "location": "Jln Sudirman No. 123",
    "status": "REPORTED"
  }'
```

---

## 🚀 Checklist Sebelum Submit

- [ ] Backend Django berjalan di port 8000
- [ ] Frontend berjalan di port 5500
- [ ] CORS configuration sudah update di settings.py
- [ ] requestAPI() function sudah dengan error handling
- [ ] app.js loadDashboardData() handle 401/403
- [ ] Browser console tidak ada error merah
- [ ] Token ada di localStorage setelah login
- [ ] Data report muncul di dashboard (tidak stuck di loading spinner)
- [ ] Bisa switch tab "Laporan Saya" ↔ "Feed Kota"
- [ ] Bisa membuat laporan baru dengan tombol "Laporan Baru"

---

## 📝 DEBUG Tips

### Tip 1: Enable Verbose Logging
```javascript
// Tambah di app.js awal file:
window.DEBUG_MODE = true;

// Modify requestAPI:
if (window.DEBUG_MODE) {
    console.log('[API Request]', {endpoint, method, token: !!token});
}
```

### Tip 2: Network Tab DevTools
1. Buka DevTools → Network tab
2. Klik saat loading
3. Cari request ke `/api/report/`
4. Lihat:
   - Status code (200, 401, 403, 500)
   - Request Headers (ada Authorization?)
   - Response (data atau error message)

### Tip 3: Test dengan Postman
1. Install Postman desktop app
2. Create new request: `GET http://127.0.0.1:8000/api/report/`
3. Tab "Headers" → Add: `Authorization: Bearer YOUR_TOKEN`
4. Send
5. Lihat response langsung

---

## 🆘 Jika Masih Error

**Lakukan ini:**
1. Restart Backend: `python manage.py runserver`
2. Restart Frontend: Reload browser (F5)
3. Clear localStorage: `localStorage.clear()` di console
4. Login ulang
5. Cek console log di tab "Menghubungkan data secure API..."

**Jika tetap tidak bisa:**
- Paste error message di browser console
- Lihat log Django backend (ada error apa?)
- Gunakan curl untuk test API secara manual (tidak ada JS involved)

---

## 📚 Referensi

- Django REST Framework: https://www.django-rest-framework.org/
- JWT Authentication: https://github.com/jpadilla/django-rest-framework-simplejwt
- CORS: https://github.com/adamchainz/django-cors-headers
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

