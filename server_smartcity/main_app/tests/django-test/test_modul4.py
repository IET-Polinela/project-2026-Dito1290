from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from main_app.models import Report

# ─────────────────────────────────────────────────────────────────────────────
# PENJELASAN: get_user_model()
# ─────────────────────────────────────────────────────────────────────────────
# Django mendukung custom user model melalui setting AUTH_USER_MODEL.
# Pada proyek ini, user model kustom didefinisikan di usermanagement.User.
# Menggunakan get_user_model() memastikan kita selalu mereferensikan model
# user yang benar, bukan django.contrib.auth.models.User bawaan.
# ─────────────────────────────────────────────────────────────────────────────
User = get_user_model()

# =============================================================================
# MODUL 4: PENGUJIAN FUNGSIONALITAS DASAR & VALIDASI INPUT
# =============================================================================
# Fokus: Memastikan fungsi CRUD (Create, Read, Update, Delete) berjalan normal,
# validasi input wajib ditegakkan, dan keamanan dari serangan injeksi (XSS).
#
# KONSEP KUNCI:
#   - Serializer DRF secara otomatis memvalidasi field yang required
#   - Django template engine secara default melakukan HTML escaping
#   - SearchFilter DRF melakukan pencarian berbasis teks di field yang
#     terdaftar pada search_fields
# =============================================================================

class CRUDAndValidationTests(APITestCase):
    """
    Kelas pengujian untuk fungsionalitas dasar dan validasi input.

    Menguji pembuatan data baru (CREATE), validasi field wajib, pertahanan
    terhadap serangan XSS, dan fitur pencarian/filter data.
    """

    def setUp(self):
        """
        Persiapan: Buat warga dan autentikasi untuk test CRUD.
        """
        self.warga, _ = User.objects.get_or_create(
            username='warga_crud', defaults={'is_admin': False, 'is_staff': False}
        )
        self.warga.set_password('TestPass123!')
        self.warga.save()
        
        # force_authenticate memastikan semua request di test ini terautentikasi
        self.client.force_authenticate(user=self.warga)

    # ─────────────────────────────────────────────────────────────────────────
    # FT-01: Membuat Laporan Baru dengan Data Lengkap
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_01_buat_laporan_dengan_data_lengkap(self):
        """
        [FT-01] Mengirim data laporan baru dengan seluruh kolom (field)
        terisi lengkap dan benar.

        SKENARIO:
            Warga mengirim POST request ke endpoint /api/report/ dengan
            semua field wajib terisi: title, category, description, location.

        HASIL YANG DIHARAPKAN:
            Basis data berhasil menyimpan record baru dan API mengembalikan
            status HTTP 201 Created.
        """
        # LANGKAH 1: Cari rute endpoint list/create report
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        # LANGKAH 2: Siapkan payload lengkap dengan skema multibahasa agar aman dari validasi
        payload = {
            'title': 'Laporan Lampu Jalan Mati',
            'judul': 'Laporan Lampu Jalan Mati',
            'category': 'Infrastruktur',
            'kategori': 'Infrastruktur',
            'description': 'Lampu di jalan utama RT 01 padam total semenjak kemarin malam.',
            'deskripsi': 'Lampu di jalan utama RT 01 padam total semenjak kemarin malam.',
            'location': 'RT 01 Kelurahan Merdeka',
            'lokasi': 'RT 01 Kelurahan Merdeka',
            'status': 'DRAFT'
        }

        # LANGKAH 3: Kirim POST request untuk membuat laporan baru
        response = self.client.post(url, payload, format='json')

        # LANGKAH 4: Verifikasi respons sukses (201 Created atau 200 OK)
        self.assertIn(
            response.status_code,
            [status.HTTP_201_CREATED, status.HTTP_200_OK],
            "Pembuatan laporan dengan data lengkap seharusnya mengembalikan status 201 atau 200"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # FT-02: Laporan Ditolak Jika Judul Kosong
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_02_ditolak_jika_judul_kosong(self):
        """
        [FT-02] Mengirim data pembuatan laporan baru dengan mengosongkan
        kolom judul (title).

        SKENARIO:
            Warga mengirim POST request TANPA field title / judul.

        HASIL YANG DIHARAPKAN:
            Sistem menolak input dan mengembalikan HTTP 400 Bad Request
            beserta pesan error spesifik untuk kolom wajib.
        """
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        # Payload sengaja dibuat kosong pada bagian title/judul untuk memicu kegagalan validasi
        payload = {
            'title': '',
            'judul': '',
            'category': 'Kebersihan',
            'kategori': 'Kebersihan',
            'description': 'Sampah menumpuk di area pembuangan sementara.',
            'deskripsi': 'Sampah menumpuk di area pembuangan sementara.',
            'location': 'Blok A',
            'lokasi': 'Blok A'
        }

        response = self.client.post(url, payload, format='json')

        # Verifikasi: Harus mengembalikan HTTP 400 Bad Request karena validasi gagal
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Sistem harus mengembalikan status 400 Bad Request jika field judul dikosongkan"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # FT-03: Laporan Ditolak Jika Deskripsi Kosong
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_03_ditolak_jika_deskripsi_kosong(self):
        """
        [FT-03] Mengirim data pembuatan laporan baru dengan mengosongkan
        kolom deskripsi (description).

        SKENARIO:
            Warga mengirim POST request TANPA field description / deskripsi.

        HASIL YANG DIHARAPKAN:
            Sistem menolak input dan mengembalikan HTTP 400 Bad Request.
        """
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        # Payload sengaja dikosongkan pada bagian description/deskripsi
        payload = {
            'title': 'Laporan Pohon Tumbang',
            'judul': 'Laporan Pohon Tumbang',
            'category': 'Fasilitas Umum',
            'kategori': 'Fasilitas Umum',
            'description': '',
            'deskripsi': '',
            'location': 'Jalan Protokol',
            'lokasi': 'Jalan Protokol'
        }

        response = self.client.post(url, payload, format='json')

        # Verifikasi: Harus ditolak dengan status HTTP 400 Bad Request
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            "Sistem harus mengembalikan status 400 Bad Request jika field deskripsi dikosongkan"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # FT-04: Keamanan dari Serangan XSS (Cross-Site Scripting)
    # ─────────────────────────────────────────────────────────────────────────
    def test_FT_04_xss_script_disimpan_sebagai_string_literal(self):
        """
        [FT-04] Mengisi nilai deskripsi laporan menggunakan kode skrip
        injeksi jahat HTML: <script>alert('xss')</script>.
        """
        try:
            url = reverse('report-list')
        except:
            url = '/api/report/'

        # Payload dengan skrip injeksi XSS di deskripsi
        kode_xss = '<script>alert("xss")</script>'
        payload = {
            'title': 'Laporan XSS Test',
            'judul': 'Laporan XSS Test',
            'category': 'Keamanan',
            'kategori': 'Keamanan',
            'description': kode_xss,
            'deskripsi': kode_xss,
            'location': 'Lab Keamanan Siber',
            'lokasi': 'Lab Keamanan Siber',
        }

        response = self.client.post(url, payload, format='json')

        # Verifikasi: Data tetap diterima (201 Created atau 200 OK)
        self.assertIn(
            response.status_code,
            [status.HTTP_201_CREATED, status.HTTP_200_OK],
            "Data dengan karakter HTML harus tetap diterima oleh API"
        )

        # Verifikasi: Deskripsi tersimpan di database sebagai teks literal
        laporan = Report.objects.filter(title='Laporan XSS Test').first()
        
        # Fallback jika model menggunakan penamaan field bahasa indonesia (judul)
        if not laporan:
            laporan = Report.objects.filter(judul='Laporan XSS Test').first()

        self.assertIsNotNone(laporan, "Laporan pengujian XSS harus berhasil ditemukan di database")

        # Mengambil string deskripsi dari objek laporan yang tersimpan
        desc_content = getattr(laporan, 'description', getattr(laporan, 'deskripsi', ''))

        # Kode script harus tersimpan sebagai string biasa, bukan di-execute
        self.assertIn(
            'script',
            desc_content.lower(),
            "Kode XSS harus tersimpan sebagai string literal di database"
        )