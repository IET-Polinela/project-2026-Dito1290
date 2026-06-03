# 🐛 COMMON ERRORS & QUICK FIXES - Lab 12 SPA

## ❌ Error 1: Loading Spinner Stuck (Data tidak muncul)

### Symptom
- Dashboard show spinner: "Menghubungkan data secure API..."
- Data tidak kunjung muncul
- Loading terus-terusan

### Diagnosis

**Langkah 1: Buka DevTools Console**
```
Tekan F12 → Console tab
Lihat ada error atau warning?
```

**Langkah 2: Cek Backend Berjalan**
```bash
curl -v http://127.0.0.1:8000/api/report/
```

Expected:
- Status: 401 Unauthorized (normal, API hanya untuk authenticated users)

Error:
- `Connection refused`: Backend tidak jalan → Start: `python manage.py runserver`
- `404 Not Found`: Endpoint not registered → Check api_urls.py

**Langkah 3: Test Token**
Di Console paste:
```javascript
localStorage.getItem('access_token')
```

Expected:
- Long string dimulai dengan "eyJ..."

Error:
- `null`: Belum login → Login dulu
- Empty string: Token corrupted → `localStorage.clear()` dan login ulang

### Quick Fix Checklist

- [ ] Backend running di port 8000?
  ```bash
  python manage.py runserver
  ```

- [ ] Frontend running di port 5500?
  ```bash
  python -m http.server 5500
  ```

- [ ] Token ada di localStorage?
  ```javascript
  localStorage.getItem('access_token')
  ```

- [ ] CORS configuration di settings.py?
  ```python
  CORS_ALLOWED_ORIGINS = ['http://127.0.0.1:5500', ...]
  ```

- [ ] Console shows `[API]` logs atau error merah?
  - Jika ada error merah → baca error messagenya

---

## ❌ Error 2: 401 Unauthorized

### Symptom
Dashboard show:
```
❌ Sesi Anda telah berakhir (401 Unauthorized)
Silakan login kembali untuk melanjutkan
```

### Root Causes

| Cause | Fix |
|-------|-----|
| Belum login | Klik tombol "Masuk" → Login dengan akun Citizen |
| Token expired | Token umur > 60 menit → Login ulang |
| Token invalid/corrupted | `localStorage.clear()` → Login ulang |
| Token tidak ter-inject | Check requestAPI() fungsi, lihat ada `Authorization: Bearer` atau tidak |
| Logout tapi tidak clear token | Restart browser atau `localStorage.clear()` |

### Debug Script

Paste di Console:
```javascript
console.log('🔍 Debugging 401 Unauthorized:');
console.log('1. Token ada?', !!localStorage.getItem('access_token'));

const token = localStorage.getItem('access_token');
if (token) {
    console.log('2. Token dimulai dengan "eyJ"?', token.startsWith('eyJ'));
    console.log('3. Token length:', token.length);
    console.log('4. Token preview:', token.substring(0, 50) + '...');
}

console.log('5. Test API request:');
fetch('http://127.0.0.1:8000/api/report/?tab=my_reports', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}).then(r => {
    console.log('6. Response status:', r.status);
    return r.json();
}).then(d => {
    console.log('7. Response data:', d);
}).catch(e => console.error('8. Error:', e));
```

### Quick Fix

```javascript
// Clear semua auth data dan login ulang
localStorage.clear();
location.reload();
// Maka akan redirect ke login page
```

---

## ❌ Error 3: 403 Forbidden

### Symptom
Dashboard show:
```
❌ Akses Ditolak (403 Forbidden)
Anda tidak memiliki izin untuk mengakses data ini
```

### Root Causes

| Cause | Fix |
|-------|-----|
| User bukan Citizen | Go to Django admin: Mark user as non-staff |
| User adalah Admin/Staff | Go to Django admin: Uncheck "Staff status" |
| Permission class blocking | Check permissions.py IsCitizen class |

### Check di Django Admin

1. Buka: http://127.0.0.1:8000/admin
2. Login dengan admin account
3. Go to: Users → Select user
4. Check:
   - ✅ `is_staff` = UNCHECKED (user harus bukan staff)
   - ✅ `is_active` = CHECKED (user harus aktif)
   - ✅ `is_superuser` = UNCHECKED (bukan superuser)

### Debug Script

Paste di Console:
```javascript
const token = localStorage.getItem('access_token');
fetch('http://127.0.0.1:8000/api/report/?tab=my_reports', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}).then(r => r.json())
.then(d => {
    console.log('Status:', r.status);
    console.log('Error:', d);
    if (d.detail) console.log('Detail:', d.detail);
});
```

---

## ❌ Error 4: CORS Error

### Symptom
Browser Console shows:
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/report/'
from origin 'http://127.0.0.1:5500' has been blocked by CORS policy:
Request header "authorization" is not allowed by Access-Control-Allow-Headers.
```

### Root Cause
CORS configuration di settings.py tidak include `Authorization` header

### Fix

Edit `npm24782073_iet_2026/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:8000',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',  # ← PENTING!
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

Kemudian restart Django:
```bash
python manage.py runserver
```

---

## ❌ Error 5: Network Error / Cannot Connect

### Symptom
Browser Console shows:
```
[API] ❌ NETWORK ERROR: TypeError: Failed to fetch
Network Error: Failed to fetch
Pastikan Backend Django berjalan di http://127.0.0.1:8000
```

### Root Causes

| Cause | Fix |
|-------|-----|
| Backend tidak running | Start: `python manage.py runserver` |
| Backend di port lain | Check port, modify BASE_URL di api.js |
| Firewall blocking | Check firewall/antivirus settings |
| Wrong BASE_URL | Check api.js: `const BASE_URL = 'http://127.0.0.1:8000'` |

### Verify Backend Running

```bash
# Terminal: Test connection
curl -v http://127.0.0.1:8000/

# Expected output:
# < HTTP/1.1 200 OK
# (atau redirect, bukan "Connection refused")
```

### Quick Fix

```bash
# Make sure you're in project folder
cd /Users/user/Documents/pi/project-2026-Dito1290

# Activate venv
source venv/bin/activate

# Start Django
python manage.py runserver

# Output should show:
# Starting development server at http://127.0.0.1:8000/
```

---

## ❌ Error 6: 404 Not Found - API Endpoint

### Symptom
Network tab shows: `/api/report/ → 404 Not Found`

### Root Causes

| Cause | Fix |
|-------|-----|
| URL tidak terdaftar | Check: npm24782073_iet_2026/urls.py, main_app/api_urls.py |
| Router tidak registered | Check api_urls.py: `router.register(r'report', ReportViewSet)` |
| API app not in INSTALLED_APPS | Check settings.py: 'main_app' ada? |

### Verify Setup

1. Check `npm24782073_iet_2026/urls.py`:
```python
path('api/', include('main_app.api_urls')),  # ← Ada?
```

2. Check `main_app/api_urls.py`:
```python
from rest_framework.routers import DefaultRouter
from .api_views import ReportViewSet

router = DefaultRouter()
router.register(r'report', ReportViewSet, basename='report')  # ← Ada?

urlpatterns = router.urls
```

3. Check `npm24782073_iet_2026/settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'main_app',  # ← Ada?
    # ...
]
```

### Quick Fix

Restart Django setelah ubah urls.py:
```bash
python manage.py runserver
```

---

## ❌ Error 7: Data Kosong (200 OK tapi tidak ada data)

### Symptom
- Dashboard load successfully
- Tidak ada error
- Tapi: "Belum ada aduan warga di kategori ini"

### Root Causes

| Cause | Fix |
|-------|-----|
| Database kosong | Create dummy data: `python manage.py generate_data` |
| Filter query salah | Check: tab='my_reports' hanya show laporan milik user |
| User tidak punya laporan | Create new report: Klik "Laporan Baru" button |
| Query filter blocking | Check: api_views.py → get_queryset() |

### Check Database

```bash
python manage.py shell

# Di shell:
from main_app.models import Report
from django.contrib.auth import get_user_model

User = get_user_model()

# See all reports
print(f"Total reports: {Report.objects.count()}")

# See reports per user
for user in User.objects.all():
    reports = Report.objects.filter(reporter=user)
    print(f"{user.username}: {reports.count()} reports")

# See all reports with status
for report in Report.objects.all():
    print(f"- {report.title} ({report.status}) by {report.reporter}")

exit()
```

### Create Dummy Data

```bash
python manage.py generate_data
```

---

## ✅ VERIFICATION CHECKLIST

After all fixes:

- [ ] Backend running: `curl -v http://127.0.0.1:8000/api/report/` → No error
- [ ] Frontend running: Open browser to http://127.0.0.1:5500
- [ ] Login works: Can login with Citizen account
- [ ] Token exists: `localStorage.getItem('access_token')` → returns string
- [ ] Console shows `[API]` logs: Check for `[API] ✓ Success 200`
- [ ] Dashboard loads: Data shows (not stuck on spinner)
- [ ] Pagination works: Can navigate pages
- [ ] Tab switching works: "Laporan Saya" ↔ "Feed Kota"
- [ ] Create report works: "Laporan Baru" button
- [ ] No red errors: Browser console clean

---

## 🎓 KEY LEARNINGS (untuk Lab Report)

1. **CORS**: Perlu whitelist origins dan headers untuk cross-origin requests
2. **JWT Token**: Harus di-inject di Authorization header sebagai "Bearer {token}"
3. **Error Handling**: Different status codes (401, 403) perlu different handling
4. **Debug**: Console logging sangat penting untuk diagnosis
5. **Permission**: Backend checking both authentication AND permission class

---

## 📞 WHEN TO ASK FOR HELP

Jika sudah coba semua fix di atas dan masih tidak bisa:

1. **Screenshot error message** (console error atau UI error)
2. **Share terminal output** (saat run `python manage.py runserver`)
3. **Describe steps** (apa yang Anda lakukan sebelum error muncul)
4. **Network tab screenshot** (DevTools → Network tab saat error)

