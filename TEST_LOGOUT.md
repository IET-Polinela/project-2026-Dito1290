# 🧪 Test Logout & API Loading Issues

## Issue Analysis
**Problem 1: Logout tidak bekerja**
- Sebelum: logout() mengganti HTML seluruh page
- Sesudah: logout() hanya set hash, biarkan router handle display

**Problem 2: API loading spinner terus berputar**
- Masalah: Setelah logout, element DOM hilang, loadDashboardData() tidak bisa render
- Solusi: Dashboard HTML tetap statis di index.html, hanya di-hide/show dengan CSS

**Fix Applied:**
1. ✅ logout() → set `window.location.hash = '#login'` saja
2. ✅ handleRouting() → show/hide dashboard dengan CSS (display: none/block)
3. ✅ setupLoginForm() → hapus duplicate rendering, gunakan yang di router.js
4. ✅ Initial routing → call handleRouting() on script load

---

## Test Steps (di browser)

### Step 1: Login
```
1. Buka http://127.0.0.1:5500
2. Input username & password
3. Klik "Masuk"
4. Expected: Redirect ke dashboard dengan data loading
```

### Step 2: Test Logout Button
```
1. Klik "Keluar" button di sidebar
2. Expected: 
   - Page menunjukkan login form
   - Token dihapus dari localStorage
   - Dashboard di-hide
3. Verify: Buka DevTools Console (F12)
   - localStorage.getItem('access_token') → null
   - typeof logout → 'function'
```

### Step 3: Check Console Logs
```
F12 → Console tab → Clear
Login again
Expected output:
[App] Checking authentication on page load...
[App] Token exists: true
[App] Token found - Loading dashboard
[API] GET http://127.0.0.1:8000/api/report/?tab=my_reports&page=1
[API] ✓ Success 200

Klik Logout:
[Auth] Logout triggered - clearing tokens
[Auth] ✓ Tokens cleared, redirecting to #login
[Auth] ✓ Login berhasil untuk [username]
```

### Step 4: Verify DOM Elements
```javascript
// Paste di console after login
console.log('Dashboard elements:');
console.log('- listContainer:', document.getElementById('listContainer') ? '✓' : '✗');
console.log('- btnNewReport:', document.getElementById('btnNewReport') ? '✓' : '✗');
console.log('- tabMyReports:', document.getElementById('tabMyReports') ? '✓' : '✗');
console.log('- reportModal:', document.getElementById('reportModal') ? '✓' : '✗');
console.log('- btnDraft:', document.getElementById('btnDraft') ? '✓' : '✗');
console.log('- btnSubmit:', document.getElementById('btnSubmit') ? '✓' : '✗');

// All should show ✓
```

### Step 5: Test API Loading
```
1. After login, data should load dengan spinner loading 1-2 detik
2. Verify data render di #listContainer
3. Klik tab "Feed Kota" → data berubah
4. Klik tab "Laporan Saya" → data berubah
```

---

## Troubleshooting

### Logout tombol tidak respond
**Check:**
```javascript
// Console
typeof logout → should be 'function'
// If 'undefined', auth.js not loaded
```

### Login form tidak muncul setelah logout
**Check:**
```javascript
// Console
document.getElementById('loginContainer') → should exist
window.location.hash → should be '#login'
```

### Data tidak load (infinite spinner)
**Check:**
```javascript
// Console after clicking "Laporan Baru"
document.getElementById('listContainer') → should exist
typeof loadDashboardData → 'function'
// Try manually: loadDashboardData('my_reports', 1)
```

### API return error 401/403
**Check:**
```javascript
localStorage.getItem('access_token') → should have token
// Token format: eyJ... (JWT)
// If missing or wrong format → login again
```

---

## Files Modified

1. **js/auth.js** - logout() simplified to set hash only
2. **js/router.js** - handleRouting() show/hide dashboard, added handleLoginSubmit()
3. **js/app.js** - checkAuthenticationAndInit() set hash only, not call functions directly
4. **js/router.js** - Added initial handleRouting() call on script load

---

## Expected Behavior After Fix

✅ **Login:** Form → Submit → Token stored → Dashboard shows data
✅ **Dashboard:** Data loads with spinner → list renders → counters update
✅ **Tab Switch:** Click "Feed Kota" / "Laporan Saya" → data changes
✅ **Logout:** Click "Keluar" → login form shows → tokens cleared
✅ **Create Report:** Click "Laporan Baru" → modal shows → submit works
✅ **Edit Draft:** List shows edit button → click → form pre-filled → submit works

---

## Quick Debug Commands

```javascript
// Check all functions available
['requestAPI', 'setupLoginForm', 'logout', 'handleRouting', 'handleLoginSubmit', 
 'setupDashboard', 'loadDashboardData', 'switchTab']
.forEach(fn => console.log(`${fn}: ${typeof window[fn] === 'function' ? '✓' : '✗'}`));

// Check current state
console.log({
    hash: window.location.hash,
    token: localStorage.getItem('access_token') ? 'exists' : 'missing',
    dashboard: document.getElementById('app-content').style.display,
    loginContainer: document.getElementById('loginContainer')?.style.display
});

// Test logout
logout();
// Should see login form appear

// Test login with sample credentials
// (depends on your database)
```

