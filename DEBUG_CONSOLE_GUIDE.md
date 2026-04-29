## 🔍 PANDUAN DEBUG: Console Kosong & Fetch API Django Dashboard

---

## 🎯 Tujuan
Menjelaskan mengapa console kosong dan bagaimana memperbaikinya agar `console.log()` dan `fetch()` berfungsi dengan baik.

---

## ❌ Penyebab Kemungkinan Console Kosong

### 1. **Script tidak dijalankan (PALING SERING)**
- ❌ Posisi `<script>` di **head**, sebelum DOM siap
- ❌ `document.addEventListener('DOMContentLoaded')` tidak digunakan
- **Solusi:** Pindahkan script ke `{% block extra_js %}` di akhir `base.html`

### 2. **URL endpoint salah**
- ❌ Fetch ke `/dashboard/data/` tapi URL tidak terdaftar
- ❌ Typo di views.py atau urls.py
- **Solusi:** Cek `dashboard/urls.py` dan jalankan `python3 manage.py runserver` untuk lihat routes

### 3. **CORS / CSRF issue**
- ❌ Fetch POST tanpa `{% csrf_token %}`
- ❌ Browser blocking request
- **Solusi:** Lihat Network tab di console untuk error

### 4. **Library pihak ketiga tidak ter-load**
- ❌ Chart.js belum di-load sebelum kode berjalan
- ❌ Bootstrap JS belum ter-load
- **Solusi:** Pastikan `<script src="...">` ada di base.html

### 5. **JavaScript error (syntax error)**
- ❌ Typo di kode JavaScript
- ❌ Missing semicolon atau bracket
- **Solusi:** Cek console, lihat error message di "Console" tab

---

## ✅ Struktur File yang BENAR

### `templates/base.html` (Akhir file)
```html
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    {% block extra_js %}{% endblock %}  <!-- ✅ POSISI INI BENAR -->
</body>
</html>
```

### `dashboard/templates/dashboard/dashboard.html` (Struktur)
```html
{% extends 'base.html' %}
{% load static %}

{% block title %}Dashboard{% endblock %}

{% block content %}
<!-- HTML CONTENT DI SINI -->
<div id="statusChart"></div>
<div id="categoryChart"></div>
...
{% endblock %}

{% block extra_js %}  <!-- ✅ SCRIPT DI SINI -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
console.log('✅ Script sudah berjalan!');  // Cek ini di console

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded fired!');
    
    fetch('/dashboard/data/')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Data diterima:', data);
        });
});
</script>
{% endblock %}
```

---

## 🔧 Langkah-Langkah Debug di Mac

### 1️⃣ **Jalankan Django Server**
```bash
cd /Users/user/Documents/pi/project-2026-Dito1290
python3 manage.py runserver
```
**Tunggu sampai muncul:**
```
Starting development server at http://127.0.0.1:8000/
```

### 2️⃣ **Buka Dashboard di Browser**
```
http://127.0.0.1:8000/dashboard/
```

### 3️⃣ **Buka Console di Mac**

**Pilihan A: Keyboard Shortcut (PALING CEPAT)**
```
⌘ + ⌥ + J     (Command + Option + J)
```

**Pilihan B: Menu**
1. Klik menu di atas → **Develop**
2. Pilih **Show JavaScript Console**

**Pilihan C: Right-click**
1. Right-click di halaman
2. Pilih **Inspect** (atau Inspect Element)
3. Klik tab **Console**

### 4️⃣ **Lihat Console Output**
Jika berfungsi, Anda akan melihat:
```
✅ Script sudah berjalan!
✅ DOMContentLoaded fired!
✅ Data diterima: {status: Array(4), category: Array(3), ...}
```

---

## 🎯 Contoh Kode Lengkap yang BENAR

### File: `dashboard/templates/dashboard/dashboard.html`

```html
{% extends 'base.html' %}
{% load static %}

{% block title %}Dashboard{% endblock %}

{% block content %}
<div class="container mt-5">
    <h1 class="display-6 fw-bold mb-4">Dashboard Laporan</h1>

    <div class="row g-4">
        <div class="col-lg-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Distribusi Status Laporan</h5>
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Distribusi Kategori Laporan</h5>
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4 mt-4">
        <div class="col-lg-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">5 Laporan Terbaru (Reported)</h5>
                </div>
                <div class="card-body">
                    <ul class="list-group" id="recent-reported">
                        <!-- Data dari fetch akan ditampilkan di sini -->
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">5 Laporan Terbaru (Resolved)</h5>
                </div>
                <div class="card-body">
                    <ul class="list-group" id="recent-resolved">
                        <!-- Data dari fetch akan ditampilkan di sini -->
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// ========== DEBUG: Pastikan Script Berjalan ==========
console.log('✅ Script dashboard.html sudah dijalankan');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM sudah siap, mulai fetch data...');
    
    // ========== FETCH DATA DARI BACKEND ==========
    fetch('/dashboard/data/')
        .then(response => {
            console.log('📍 Response received:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Data berhasil diterima:', data);
            
            // Extract data
            const statusLabels = data.status.map(item => item.status);
            const statusValues = data.status.map(item => item.total);
            const categoryLabels = data.category.map(item => item.category);
            const categoryValues = data.category.map(item => item.total);
            
            console.log('📊 Status Labels:', statusLabels);
            console.log('📊 Status Values:', statusValues);
            console.log('📊 Category Labels:', categoryLabels);
            console.log('📊 Category Values:', categoryValues);
            
            // ========== BUAT DOUGHNUT CHART (STATUS) ==========
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            const statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusValues,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('✅ Doughnut Chart (Status) berhasil dibuat');
            
            // ========== BUAT BAR CHART (KATEGORI) ==========
            const categoryCtx = document.getElementById('categoryChart').getContext('2d');
            const categoryChart = new Chart(categoryCtx, {
                type: 'bar',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        label: 'Jumlah Laporan',
                        data: categoryValues,
                        backgroundColor: '#36A2EB'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            console.log('✅ Bar Chart (Kategori) berhasil dibuat');
            
            // ========== TAMPILKAN RECENT REPORTED ==========
            const reportedList = document.getElementById('recent-reported');
            if (data.recent_reported.length === 0) {
                reportedList.innerHTML = '<li class="list-group-item">Belum ada laporan REPORTED</li>';
                console.log('⚠️  Tidak ada laporan REPORTED');
            } else {
                data.recent_reported.forEach(report => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = `${report.title} - ${report.location}`;
                    reportedList.appendChild(li);
                });
                console.log(`✅ ${data.recent_reported.length} laporan REPORTED ditampilkan`);
            }
            
            // ========== TAMPILKAN RECENT RESOLVED ==========
            const resolvedList = document.getElementById('recent-resolved');
            if (data.recent_resolved.length === 0) {
                resolvedList.innerHTML = '<li class="list-group-item">Belum ada laporan RESOLVED</li>';
                console.log('⚠️  Tidak ada laporan RESOLVED');
            } else {
                data.recent_resolved.forEach(report => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = `${report.title} - ${report.location}`;
                    resolvedList.appendChild(li);
                });
                console.log(`✅ ${data.recent_resolved.length} laporan RESOLVED ditampilkan`);
            }
        })
        .catch(error => {
            console.error('❌ ERROR: Gagal fetch data', error);
            alert('❌ Gagal memuat data dashboard. Cek console untuk detail error.');
        });
});
</script>
{% endblock %}
```

---

## 🐛 Troubleshooting - Jika Console Kosong

### ❌ Error: "Uncaught SyntaxError"
```
❌ Uncaught SyntaxError: Unexpected token } in JSON at position X
```
**Penyebab:** JSON dari backend tidak valid
**Solusi:**
1. Cek `dashboard/views.py` - pastikan format array of objects
2. Buka `http://127.0.0.1:8000/dashboard/data/` di browser
3. Lihat apakah JSON valid (gunakan jsonlint.com)

### ❌ Error: "404 Not Found"
```
❌ GET /dashboard/data/ 404
```
**Penyebab:** URL tidak terdaftar di `urls.py`
**Solusi:**
1. Cek `dashboard/urls.py` - pastikan ada `path('data/', views.dashboard_data, ...)`
2. Cek `npm24782073_iet_2026/urls.py` - pastikan ada `path('dashboard/', include('dashboard.urls'))`
3. Restart server: `Ctrl+C` lalu `python3 manage.py runserver`

### ❌ Chart tidak muncul, tapi console kosong
**Penyebab:** Chart.js belum ter-load
**Solusi:**
1. Pastikan CDN Chart.js ada di template
2. Cek Network tab → pastikan `chart.js` ter-download
3. Jika 404, gunakan CDN yang bekerja

### ❌ Console tetap kosong meski sudah ikuti langkah
**Penyebab:** Browser cache
**Solusi:**
1. Tekan `Cmd + Shift + Delete` → Clear Browsing Data
2. Pilih "Cookies and other site data"
3. Reload halaman dengan `Cmd + R`
4. Buka console lagi

---

## 📍 Network Tab - Lihat Request & Response

1. Buka Console dengan `⌘ + ⌥ + J`
2. Klik tab **Network**
3. Reload halaman dengan `⌘ + R`
4. Cari request ke `/dashboard/data/`
5. Klik, buka tab **Response** untuk lihat JSON
6. Tab **Preview** untuk format yang lebih rapi

### Contoh Response yang Benar:
```json
{
  "status": [
    {"status": "REPORTED", "total": 5},
    {"status": "RESOLVED", "total": 3}
  ],
  "category": [
    {"category": "infrastruktur", "total": 4}
  ]
}
```

---

## 📋 Checklist untuk Debug

- [ ] Jalankan server: `python3 manage.py runserver`
- [ ] Buka dashboard: `http://127.0.0.1:8000/dashboard/`
- [ ] Buka console: `⌘ + ⌥ + J`
- [ ] Lihat console.log:
  - [ ] "✅ Script sudah berjalan!"
  - [ ] "✅ DOMContentLoaded fired!"
  - [ ] "✅ Data berhasil diterima: {...}"
  - [ ] "✅ Doughnut Chart (Status) berhasil dibuat"
  - [ ] "✅ Bar Chart (Kategori) berhasil dibuat"
- [ ] Lihat Network tab:
  - [ ] Status `/dashboard/data/` adalah **200 OK**
  - [ ] Response tab menampilkan JSON dengan array
- [ ] Lihat halaman:
  - [ ] Grafik sudah muncul
  - [ ] Daftar laporan sudah terisi

---

## 📚 Referensi

- [MDN - Console](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN - DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)
- [Django - JsonResponse](https://docs.djangoproject.com/en/4.2/ref/request-response/#jsonresponse)
