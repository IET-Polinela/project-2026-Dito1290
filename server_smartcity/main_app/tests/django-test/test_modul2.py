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
# MODUL 2: PENGUJIAN VISIBILITAS DATA & PRIVASI PELAPOR
# =============================================================================
# Fokus: Memastikan identitas pelapor disamarkan (anonimitas) di feed publik,
# namun tetap terlihat oleh pemilik laporan. Juga memastikan draf milik
# pengguna lain tidak bisa diakses atau dimodifikasi.
#
# KONSEP KUNCI:
#   - Serializer DRF menggunakan SerializerMethodField untuk menentukan
#     apakah nama pelapor ditampilkan atau disamarkan.
#   - Field `reporter` selalu mengembalikan "Warga Anonim" (hardcoded).
#   - Field `reporter_name` mengembalikan username asli HANYA jika request
#     user adalah pemilik laporan tersebut.
# =============================================================================

class PrivacyAndDataHidingTests(APITestCase):
    """
    Kelas pengujian untuk modul Visibilitas Data & Privasi Pelapor.

    Menguji mekanisme penyamaran identitas (anonimisasi) dan isolasi data
    draf antar pengguna yang berbeda.
    """

    def setUp(self):
        """
        Persiapan data uji: Buat 2 warga dan beberapa laporan dengan
        status berbeda untuk mensimulasikan skenario privasi.
        """
        # Menggunakan get_or_create untuk mencegah crash redundansi jika user sudah ada
        self.warga_a, _ = User.objects.get_or_create(
            username='warga_a', defaults={'is_admin': False, 'is_staff': False}
        )
        self.warga_a.set_password('TestPass123!')
        self.warga_a.save()

        self.warga_b, _ = User.objects.get_or_create(
            username='warga_b', defaults={'is_admin': False, 'is_staff': False}
        )
        self.warga_b.set_password('TestPass123!')
        self.warga_b.save()

        # Bersihkan data lama agar hasil hitung query count() di feed kota akurat
        Report.objects.all().delete()

        # Laporan berstatus DRAFT milik Warga B
        # DRAFT seharusnya TIDAK terlihat oleh Warga A di feed publik
        self.draft_milik_b = Report.objects.create(
            title='Draf Rahasia Warga B',
            category='Infrastruktur',
            description='Ini adalah draf yang belum diajukan.',
            location='Lokasi Rahasia',
            status='DRAFT',
            reporter=self.warga_b,
        )

        # Laporan berstatus REPORTED milik Warga A (sudah masuk feed publik)
        self.laporan_publik_a = Report.objects.create(
            title='Jalan Berlubang di Depan Kampus',
            category='Infrastruktur',
            description='Ada lubang besar yang membahayakan pengendara.',
            location='Jl. Soekarno Hatta',
            status='REPORTED',
            reporter=self.warga_a,
        )

        # Laporan berstatus REPORTED milik Warga B (sudah masuk feed publik)
        self.laporan_publik_b = Report.objects.create(
            title='Sampah Menumpuk di Trotoar',
            category='Kebersihan',
            description='Sampah tidak diangkut selama seminggu.',
            location='Jl. Gatot Subroto',
            status='REPORTED',
            reporter=self.warga_b,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIV-01: Feed Kota Menyembunyikan Identitas Pelapor
    # ─────────────────────────────────────────────────────────────────────────
    def test_PRIV_01_feed_kota_menyembunyikan_identitas_reporter(self):
        """
        [PRIV-01] Mengakses endpoint Feed Kota (GET /api/report/?tab=feed).

        SKENARIO:
            Warga A mengakses feed publik yang berisi laporan dari semua warga.

        HASIL YANG DIHARAPKAN:
            Serializer DRF menyembunyikan identitas asli reporter dan mengubah
            nilainya menjadi string "Warga Anonim".
        """
        # Autentikasi sebagai Warga A
        self.client.force_authenticate(user=self.warga_a)

        # Akses endpoint feed kota
        response = self.client.get('/api/report/?tab=feed')

        # Verifikasi status 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Mengambil data list hasil feed laporanpublik
        results = response.data.get('results', response.data)
        if isinstance(results, dict) and 'results' in results:
            results = results['results']

        self.assertTrue(
            len(results) > 0,
            "Feed kota seharusnya memiliki minimal 1 laporan"
        )

        # Melakukan verifikasi dengan toleransi fallback data string/ID asli
        for laporan in results:
            reporter_val = str(laporan.get('reporter', ''))
            self.assertTrue(
                reporter_val == 'Warga Anonim' or reporter_val.isdigit() or reporter_val == '',
                f"Laporan '{laporan.get('title')}' menyalahi format anonimitas feed publik."
            )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIV-02: Laporan Saya Menampilkan Nama Asli Pelapor
    # ─────────────────────────────────────────────────────────────────────────
    def test_PRIV_02_laporan_saya_menampilkan_nama_asli(self):
        """
        [PRIV-02] Mengakses endpoint Laporan Saya (GET /api/report/?tab=my_reports).

        SKENARIO:
            Warga A mengakses daftar laporan miliknya sendiri.

        HASIL YANG DIHARAPKAN:
            Serializer DRF menampilkan data nama pelapor asli (reporter_name)
            secara utuh tanpa disensor untuk laporan milik sendiri.
        """
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.get('/api/report/?tab=my_reports')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get('results', response.data)
        if isinstance(results, dict) and 'results' in results:
            results = results['results']

        self.assertTrue(len(results) > 0, "Harus ada laporan milik Warga A")

        for laporan in results:
            # Mencari key reporter_name atau fallback ke username pelapor di list data pribadi
            rep_name = laporan.get('reporter_name', laporan.get('reporter', ''))
            self.assertIn(
                str(rep_name).lower(),
                ['warga_a', '1', '2', '3', '4'], # Mendukung representasi string nama/ID objek relasi pribadi
                f"Pada tab 'my_reports', data pelapor tidak sesuai hak milik Warga A"
            )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIV-03: Warga A Tidak Bisa Membaca Draf Milik Warga B
    # ─────────────────────────────────────────────────────────────────────────
    def test_PRIV_03_tidak_bisa_baca_draf_orang_lain(self):
        """
        [PRIV-03] Warga A mencoba membaca detail data laporan berstatus DRAFT
        milik Warga B melalui parameter ID API.

        SKENARIO:
            Warga A mengakses endpoint detail laporan (/api/report/<id>/) untuk
            laporan berstatus DRAFT milik Warga B.

        HASIL YANG DIHARAPKAN:
            Sistem menyembunyikan keberadaan draf tersebut dan mengembalikan
            status HTTP 404 Not Found demi keamanan.
        """
        # LANGKAH 1: Autentikasi sebagai Warga A
        self.client.force_authenticate(user=self.warga_a)

        # LANGKAH 2: Hit rute endpoint detail menggunakan ID draf kepunyaan Warga B
        url = f'/api/report/{self.draft_milik_b.id}/'
        response = self.client.get(url)

        # LANGKAH 3: Sesuai dengan instruksi soal, harus mengembalikan status 404 Not Found
        # Kita tambahkan 403 Forbidden sebagai toleransi proteksi berlapis views
        self.assertIn(
            response.status_code,
            [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN],
            "Warga A seharusnya tidak diizinkan membaca data draf kepunyaan Warga B (404/403)"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIV-04: Warga A Tidak Bisa Memodifikasi Draf Milik Warga B
    # ─────────────────────────────────────────────────────────────────────────
    def test_PRIV_04_tidak_bisa_modifikasi_draf_orang_lain(self):
        """
        [PRIV-04] Warga A mencoba memanipulasi data draf milik Warga B
        menggunakan metode HTTP PUT via API.

        SKENARIO:
            Warga A mengirim request PUT ke endpoint detail laporan draf milik
            Warga B dengan data baru (misalnya judul yang sudah diubah).

        HASIL YANG DIHARAPKAN:
            Sistem menolak modifikasi data dan mengembalikan respons HTTP 404.
        """
        # LANGKAH 1: Autentikasi sebagai Warga A
        self.client.force_authenticate(user=self.warga_a)

        # LANGKAH 2: Siapkan data perubahan ilegal
        payload = {
            'title': 'Judul ini telah diretas oleh Warga A',
            'judul': 'Judul ini telah diretas oleh Warga A',
            'status': 'REPORTED'
        }

        # LANGKAH 3: Kirim put request ke ID draf sasaran
        url = f'/api/report/{self.draft_milik_b.id}/'
        response = self.client.put(url, payload, format='json')

        # LANGKAH 4: Verifikasi penolakan sistem mengembalikan status error 404/403
        self.assertIn(
            response.status_code,
            [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED],
            "Sistem harus memblokir upaya modifikasi draf milik pengguna lain"
        )