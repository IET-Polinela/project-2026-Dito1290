# Dashboard JSON Format Guide

## 📊 Masalah yang Diperbaiki

### Format Lama (DICTIONARY / OBJECT)
```json
{
  "status": {
    "REPORTED": 2,
    "RESOLVED": 3,
    "VERIFIED": 1
  },
  "category": {
    "lama": 2,
    "makan": 1,
    "infrastruktur": 2
  }
}
```

**Masalah:**
- Menggunakan `Object.keys()` dan `Object.values()` di JavaScript
- Tidak konsisten dengan data recent reports yang sudah berupa array
- Lebih rumit untuk pemrosesan di Chart.js
- Urutan key tidak dijamin (bergantung pada browser)

### Format Baru (ARRAY OF OBJECTS) ✅
```json
{
  "status": [
    {"status": "REPORTED", "total": 2},
    {"status": "RESOLVED", "total": 3},
    {"status": "VERIFIED", "total": 1}
  ],
  "category": [
    {"category": "lama", "total": 2},
    {"category": "makan", "total": 1},
    {"category": "infrastruktur", "total": 2}
  ]
}
```

**Keuntungan:**
- Konsisten dengan format REST API modern
- Lebih mudah di-mapping dengan `map()` di JavaScript
- Urutan terjaga sesuai sorting di Django
- Lebih scalable untuk fitur tambahan (contoh: persentase, trend)

---

## 🔧 Views.py - Perbedaan Kode

### SEBELUM (Salah)
```python
def dashboard_data(request):
    status_counts = Report.objects.values('status').annotate(count=Count('status')).order_by('status')
    
    # ❌ Menghasilkan dictionary
    status_data = {item['status']: item['count'] for item in status_counts}
    
    data = {
        'status': status_data,  # Output: {"REPORTED": 2, "RESOLVED": 3}
    }
    return JsonResponse(data)
```

### SESUDAH (Benar) ✅
```python
def dashboard_data(request):
    status_counts = Report.objects.values('status').annotate(count=Count('status')).order_by('status')
    
    # ✅ Menghasilkan array of objects
    status_data = [
        {'status': item['status'], 'total': item['count']} 
        for item in status_counts
    ]
    
    data = {
        'status': status_data,  # Output: [{"status": "REPORTED", "total": 2}, ...]
    }
    return JsonResponse(data)
```

### Penjelasan Kode Django ORM

```python
# 1. Query aggregation dengan Django ORM
status_counts = Report.objects.values('status').annotate(count=Count('status')).order_by('status')

# Hasil QuerySet (mirip list of dicts):
# <QuerySet [
#     {'status': 'REPORTED', 'count': 2},
#     {'status': 'RESOLVED', 'count': 3},
#     {'status': 'VERIFIED', 'count': 1}
# ]>

# 2. Convert ke format yang sesuai untuk API
status_data = [
    {'status': item['status'], 'total': item['count']} 
    for item in status_counts
]

# Output:
# [
#     {'status': 'REPORTED', 'total': 2},
#     {'status': 'RESOLVED', 'total': 3},
#     {'status': 'VERIFIED', 'total': 1}
# ]
```

---

## 📈 JavaScript - Perbedaan Kode Chart.js

### SEBELUM (Memaksa Object.keys/values)
```javascript
fetch('/dashboard/data/')
    .then(response => response.json())
    .then(data => {
        // ❌ Menggunakan Object.keys dan Object.values
        const statusLabels = Object.keys(data.status);     // ["REPORTED", "RESOLVED", "VERIFIED"]
        const statusValues = Object.values(data.status);   // [2, 3, 1]
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{data: statusValues}]
            }
        });
    });
```

**Masalah:**
- Tidak jelas bahwa ini adalah key/value pairs
- Sulit untuk menambah property lain (contoh: persentase)
- Array bisa tidak sinkron urutan

### SESUDAH (Menggunakan map()) ✅
```javascript
fetch('/dashboard/data/')
    .then(response => response.json())
    .then(data => {
        // ✅ Menggunakan array.map() - lebih clean & functional
        const statusLabels = data.status.map(item => item.status);   // ["REPORTED", "RESOLVED", "VERIFIED"]
        const statusValues = data.status.map(item => item.total);    // [2, 3, 1]
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{data: statusValues}]
            }
        });
    });
```

**Keuntungan:**
- Lebih semantic dan mudah dibaca
- Mudah untuk menambah kalkulasi (contoh: persentase)
- Functional programming approach

---

## 🎨 Contoh Lengkap - Doughnut Chart (Status)

```javascript
// JSON dari fetch
const data = {
  status: [
    {status: "REPORTED", total: 5},
    {status: "RESOLVED", total: 3},
    {status: "VERIFIED", total: 2},
    {status: "IN_PROGRESS", total: 1}
  ]
};

// Extract labels dan values
const statusLabels = data.status.map(item => item.status);
const statusValues = data.status.map(item => item.total);

// Render Chart.js Doughnut
const statusCtx = document.getElementById('statusChart').getContext('2d');
const statusChart = new Chart(statusCtx, {
    type: 'doughnut',
    data: {
        labels: statusLabels,  // ["REPORTED", "RESOLVED", "VERIFIED", "IN_PROGRESS"]
        datasets: [{
            data: statusValues,  // [5, 3, 2, 1]
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
```

---

## 📊 Contoh Lengkap - Bar Chart (Kategori)

```javascript
// JSON dari fetch
const data = {
  category: [
    {category: "infrastruktur", total: 4},
    {category: "sampah", total: 3},
    {category: "jalan", total: 2}
  ]
};

// Extract labels dan values
const categoryLabels = data.category.map(item => item.category);
const categoryValues = data.category.map(item => item.total);

// Render Chart.js Bar
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
const categoryChart = new Chart(categoryCtx, {
    type: 'bar',
    data: {
        labels: categoryLabels,  // ["infrastruktur", "sampah", "jalan"]
        datasets: [{
            label: 'Jumlah Laporan',
            data: categoryValues,  // [4, 3, 2]
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
```

---

## ✅ Checklist Implementasi

- [x] Views.py mengembalikan array of objects
- [x] JavaScript menggunakan `.map()` untuk extract labels dan values
- [x] Chart.js configuration sudah updated
- [x] Format konsisten dengan REST API modern
- [x] Code lebih clean dan maintainable

---

## 📚 Referensi

- [Django ORM - values() + annotate()](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#values)
- [Chart.js - Configuration](https://www.chartjs.org/docs/latest/configuration/)
- [JavaScript - Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
