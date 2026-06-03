# ✅ FITUR YANG HARUS DITEST - Lab 12 SPA

## 🔐 1. Authentication
- [ ] **Login**: Buka http://127.0.0.1:5500 → Input username & password → Klik "Masuk"
  - Expected: Redirect ke dashboard, token di localStorage
  - Test: Buka DevTools Console → `localStorage.getItem('access_token')`

- [ ] **Logout**: Klik tombol "Keluar" di sidebar
  - Expected: Token dihapus, redirect ke login page
  - Test: `localStorage.getItem('access_token')` → should be null

## 📊 2. Dashboard
- [ ] **Load Data**: Dashboard muncul setelah login
  - Expected: Kartu laporan muncul dari API
  - Check: DevTools Network → `/api/report/` → status 200

- [ ] **Dark Mode Toggle**: Klik icon moon di sidebar kanan
  - Expected: Tema gelap aktivasi
  - Check: Body punya class `dark-theme`, localStorage `theme-mode=dark`

## 📑 3. Tab Navigation
- [ ] **Switch Tab**: Klik "Laporan Saya" vs "Feed Kota"
  - Expected: Data berubah, tab active indicator berubah
  - "Laporan Saya": Show only user's reports
  - "Feed Kota": Show all reports except drafts & anonymous

## 📄 4. Report Management
- [ ] **Create Report**: Klik "Laporan Baru" → Isi form → Klik "Ajukan"
  - Expected: Modal muncul, form fields kosong, API POST response 201
  - Check: Laporan baru muncul di dashboard

- [ ] **Save Draft**: Klik "Laporan Baru" → Isi form → Klik "Simpan Draft"
  - Expected: Report status = DRAFT, hanya terlihat di "Laporan Saya" tab
  - Check: Badge Draft counter bertambah

- [ ] **Edit Draft**: Click "Edit" button pada draft report
  - Expected: Modal muncul dengan data pre-filled
  - Check: Form fields sudah isi dengan data lama

- [ ] **Submit Draft**: Edit laporan → Klik "Ajukan"
  - Expected: API PUT request, status berubah jadi REPORTED
  - Check: Report tidak lagi di tab "Laporan Saya" (sudah submit)

## 🔄 5. Pagination
- [ ] **Navigate Pages**: Jika ada > 10 reports, buttons paging muncul
  - Expected: Klik halaman 2, 3, dst → data berubah
  - Check: DevTools Network → `page=2`, `page=3`, etc

## 📊 6. Sidebar Stats
- [ ] **Draft Counter**: Submit laporan baru sebagai DRAFT
  - Expected: Badge "Draft" counter bertambah
  - Check: Sidebar badge nomor update

- [ ] **Process Counter**: Submit laporan sebagai REPORTED
  - Expected: Badge "Diproses" counter bertambah

- [ ] **Done Counter**: Lihat laporan dengan status RESOLVED
  - Expected: Badge "Selesai" counter bertambah
  - Note: RESOLVED status mungkin perlu di-set dari backend admin panel

## 🌐 7. API Integration
- [ ] **Token Injection**: Create/Edit report
  - Check DevTools Network → Request Headers → `Authorization: Bearer {token}`

- [ ] **Error 401**: Clear localStorage → Reload
  - Expected: Redirect ke login dengan message "Sesi berakhir"

- [ ] **Error 403**: (Skip jika semua user adalah Citizen)
  - Expected: Message "Akses Ditolak"

## 🎨 8. UI/UX
- [ ] **Responsive**: Test di:
  - Desktop (> 1024px): 3-column layout
  - Tablet (768-1024px): 2-3 column layout
  - Mobile (< 768px): 1 column layout

- [ ] **Status Badge Colors**: 
  - DRAFT: Orange
  - REPORTED: Blue
  - VERIFIED: Green
  - IN_PROGRESS: Purple
  - RESOLVED: Teal

- [ ] **Loading Spinner**: Saat load data
  - Expected: Muncul "Menghubungkan data secure API..." spinner

---

## ⚡ Quick Test Checklist

```bash
# Terminal 1: Backend
python manage.py runserver

# Terminal 2: Frontend
cd smartcity_citizen_spa_24782073
python -m http.server 5500
```

Browser Console Commands:
```javascript
// Check token
localStorage.getItem('access_token')

// Check theme
localStorage.getItem('theme-mode')

// Check global state
console.log({currentTab, currentPage, editingReportId})

// Manual API test
const token = localStorage.getItem('access_token');
fetch('http://127.0.0.1:8000/api/report/?tab=my_reports', {
    headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(d => console.log(d))
```

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Login gagal | Check username/password, verify user is Citizen (not staff) |
| Data kosong | Create dummy data: `python manage.py generate_data` |
| Logout tidak bekerja | Buka DevTools Console → Check `localStorage.clear()` |
| Dark mode tidak bekerja | Clear localStorage → Reload → Try again |
| Create report error | Check form validation, verify all fields filled |
| Token tidak ter-inject | Check DevTools Network tab → Request Headers |

