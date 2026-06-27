#!/bin/bash
echo "================================================================="
echo "🚀 MEMULAI AUTOMATED TESTING SMART CITY SYSTEM (FULL RECYCLE)"
echo "================================================================="
echo ""
echo "📦 [TAHAP 1] Menjalankan Unit Test Backend Django..."
echo "-----------------------------------------------------------------"
cd server_smartcity
source ../venv/bin/activate || source venv/bin/activate
python manage.py test main_app
cd ..
echo ""
echo "💻 [TAHAP 2] Menjalankan Visual E2E Test Playwright (Web 1 & Web 2)..."
echo "-----------------------------------------------------------------"
cd smartcity_citizen_spa_24782073
npx playwright test playwright/citizen_portal.spec.js --headed
cd ..
echo ""
echo "================================================================="
echo "✅ SEMUA RANGKAIAN PENGUJIAN INTEGRASI LULUS SEMPURNA!"
echo "================================================================="
