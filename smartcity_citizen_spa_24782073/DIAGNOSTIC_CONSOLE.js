// ============================================================
// DIAGNOSTIC SCRIPT - Paste di Browser Console untuk test
// ============================================================
console.log("🔍 SPA DIAGNOSTIC TEST");
console.log("=".repeat(60));

// 1. CHECK SCRIPT LOADING
console.log("\n✓ SCRIPT LOADING CHECK");
console.log("- api.js:", typeof requestAPI === 'function' ? '✓ Loaded' : '✗ Missing');
console.log("- auth.js:", typeof setupLoginForm === 'function' ? '✓ Loaded' : '✗ Missing');
console.log("- router.js:", typeof handleRouting === 'function' ? '✓ Loaded' : '✗ Missing');
console.log("- app.js:", typeof setupDashboard === 'function' ? '✓ Loaded' : '✗ Missing');

// 2. CHECK BOOTSTRAP
console.log("\n✓ BOOTSTRAP CHECK");
console.log("- Bootstrap:", typeof bootstrap !== 'undefined' ? '✓ Loaded' : '✗ Missing');
if (typeof bootstrap !== 'undefined') {
    console.log("- Bootstrap.Modal:", typeof bootstrap.Modal !== 'undefined' ? '✓ Available' : '✗ Missing');
}

// 3. CHECK DOM ELEMENTS
console.log("\n✓ DOM ELEMENTS CHECK");
const elements = {
    'app-content': 'Main container',
    'btnNewReport': 'Tombol Laporan Baru',
    'reportModal': 'Modal form',
    'reportForm': 'Form laporan',
    'btnDraft': 'Tombol Simpan Draft',
    'btnSubmit': 'Tombol Ajukan',
    'tabMyReports': 'Tab Laporan Saya',
    'tabFeed': 'Tab Feed Kota',
    'listContainer': 'Container list report',
    'paginationContainer': 'Container pagination',
    'btnDarkModeToggle': 'Tombol Dark Mode',
    'badgeDraft': 'Badge Draft',
    'badgeProcess': 'Badge Diproses',
    'badgeDone': 'Badge Selesai'
};

Object.entries(elements).forEach(([id, label]) => {
    const el = document.getElementById(id);
    console.log(`- ${label} (#${id}):`, el ? '✓ Found' : '✗ Missing');
});

// 4. CHECK AUTHENTICATION
console.log("\n✓ AUTHENTICATION CHECK");
const token = localStorage.getItem('access_token');
console.log("- Token exists:", token ? '✓ Yes' : '✗ No');
if (token) {
    console.log("- Token length:", token.length);
    console.log("- Token starts with 'eyJ':", token.startsWith('eyJ') ? '✓ Valid JWT' : '✗ Invalid format');
    console.log("- Token preview:", token.substring(0, 50) + '...');
}

// 5. CHECK GLOBAL STATE
console.log("\n✓ GLOBAL STATE CHECK");
if (typeof currentTab !== 'undefined') {
    console.log("- currentTab:", currentTab);
    console.log("- currentPage:", currentPage);
    console.log("- editingReportId:", editingReportId);
    console.log("- reportModalInstance:", reportModalInstance ? 'Initialized' : 'Not initialized');
}

// 6. CHECK STORAGE
console.log("\n✓ LOCAL STORAGE CHECK");
console.log("- access_token:", localStorage.getItem('access_token') ? '✓ Stored' : '✗ Not stored');
console.log("- refresh_token:", localStorage.getItem('refresh_token') ? '✓ Stored' : '✗ Not stored');
console.log("- theme-mode:", localStorage.getItem('theme-mode') || 'light (default)');
console.log("- spa-theme:", localStorage.getItem('spa-theme') || 'light (default)');

// 7. QUICK FUNCTION TEST
console.log("\n✓ FUNCTION AVAILABILITY");
const functions = [
    'setupDashboard',
    'switchTab',
    'loadDashboardData',
    'renderList',
    'renderPagination',
    'loadSummaryStats',
    'editDraft',
    'submitReport',
    'setupDarkMode',
    'handleRouting',
    'setupLoginForm',
    'logout',
    'requestAPI'
];

functions.forEach(fn => {
    console.log(`- ${fn}:`, typeof window[fn] === 'function' ? '✓ Available' : '✗ Missing');
});

// 8. TEST API CONNECTION
console.log("\n✓ API CONNECTION TEST");
if (typeof requestAPI === 'function' && token) {
    console.log("Testing API connection...");
    requestAPI('/api/report/?tab=my_reports&page=1', 'GET')
        .then(response => {
            console.log("- Response status:", response.status);
            console.log("- Response OK:", response.ok ? '✓ Yes' : '✗ No');
            return response.json();
        })
        .then(data => {
            console.log("- Response data:", data);
            console.log("- Results count:", data.results ? data.results.length : 'N/A');
        })
        .catch(e => console.error("- API Error:", e));
} else {
    console.log("- Skipped: Token not available or requestAPI not loaded");
}

// 9. FEATURE TEST FUNCTIONS
console.log("\n✓ MANUAL FEATURE TEST FUNCTIONS");
console.log("Run these commands in console:");
console.log("\nTest 1 - Check Tab Switch:");
console.log("  switchTab('feed')");
console.log("  // Expected: Tab berubah, data berubah");

console.log("\nTest 2 - Open Report Modal:");
console.log("  if (reportModalInstance) reportModalInstance.show()");
console.log("  // Expected: Modal form muncul");

console.log("\nTest 3 - Reset Form:");
console.log("  document.getElementById('reportForm').reset()");

console.log("\nTest 4 - Toggle Dark Mode:");
console.log("  document.body.classList.toggle('dark-theme')");

console.log("\nTest 5 - Check Dashboard Data:");
console.log("  loadDashboardData('my_reports', 1)");

console.log("\nTest 6 - Logout:");
console.log("  logout()");

console.log("\n" + "=".repeat(60));
console.log("✅ DIAGNOSTIC COMPLETE - Check issues above");
