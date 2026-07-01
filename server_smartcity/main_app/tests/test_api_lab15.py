from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from main_app.models import Report


User = get_user_model()


class Lab15BackendTests(APITestCase):
    def setUp(self):
        self.warga_a, _ = User.objects.get_or_create(
            username='warga_a',
            defaults={'is_admin': False, 'is_staff': False},
        )
        self.warga_a.set_password('Password123!')
        self.warga_a.save()

        self.warga_b, _ = User.objects.get_or_create(
            username='warga_b',
            defaults={'is_admin': False, 'is_staff': False},
        )
        self.warga_b.set_password('Password123!')
        self.warga_b.save()

        self.draft_milik_b = Report.objects.create(
            title='Draf Rahasia Warga B',
            category='Infrastruktur',
            description='Ini adalah draft rahasia.',
            location='Lokasi Rahasia',
            status='DRAFT',
            reporter=self.warga_b,
        )

        self.reported_a = Report.objects.create(
            title='Jalan Rusak',
            category='Infrastruktur',
            description='Ada jalan berlubang.',
            location='Jl. Merdeka',
            status='REPORTED',
            reporter=self.warga_a,
        )

        self.reported_b = Report.objects.create(
            title='Sampah Menumpuk',
            category='Kebersihan',
            description='Sampah tidak dibersihkan.',
            location='Jl. Sudirman',
            status='REPORTED',
            reporter=self.warga_b,
        )

        self.resolved_a = Report.objects.create(
            title='Lampu Mati',
            category='Fasilitas Umum',
            description='Lampu sudah diperbaiki.',
            location='Jl. Sudirman',
            status='RESOLVED',
            reporter=self.warga_a,
        )

    def test_AUTH_01_login_warga_dengan_kredensial_valid(self):
        url = reverse('token_obtain_pair')
        payload = {'username': 'warga_a', 'password': 'Password123!'}

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_AUTH_02_login_warga_dengan_password_salah(self):
        url = reverse('token_obtain_pair')
        payload = {'username': 'warga_a', 'password': 'salah'}

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

    def test_PRIV_01_feed_menyamarkan_nama_pelapor(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.get('/api/report/?tab=feed')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        if isinstance(results, dict) and 'results' in results:
            results = results['results']

        self.assertTrue(len(results) > 0)
        for item in results:
            self.assertEqual(item.get('reporter_name'), 'Warga Anonim')

    def test_PRIV_02_my_reports_menampilkan_nama_asli(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.get('/api/report/?tab=my_reports')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        if isinstance(results, dict) and 'results' in results:
            results = results['results']

        self.assertTrue(len(results) > 0)
        self.assertTrue(any(item.get('reporter_name') == 'warga_a' for item in results))

    def test_PRIV_03_warga_tidak_bisa_membaca_draft_orang_lain(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.get(f'/api/report/{self.draft_milik_b.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_PRIV_04_warga_tidak_bisa_memodifikasi_draft_orang_lain(self):
        self.client.force_authenticate(user=self.warga_a)

        payload = {'title': 'Judul hasil edit', 'status': 'REPORTED'}
        response = self.client.put(f'/api/report/{self.draft_milik_b.id}/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.draft_milik_b.refresh_from_db()
        self.assertEqual(self.draft_milik_b.title, 'Draf Rahasia Warga B')

    def test_WF_01_pemilik_bisa_ubah_draft_ke_reported(self):
        self.client.force_authenticate(user=self.warga_a)
        report = Report.objects.create(
            title='Draft saya',
            category='Infrastruktur',
            description='Belum diajukan',
            location='Depan rumah',
            status='DRAFT',
            reporter=self.warga_a,
        )

        response = self.client.put(
            f'/api/report/{report.id}/',
            {
                'title': report.title,
                'category': report.category,
                'description': report.description,
                'location': report.location,
                'status': 'REPORTED',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'REPORTED')

    def test_WF_02_warga_tidak_bisa_edit_laporan_reported(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.put(
            f'/api/report/{self.reported_a.id}/',
            {'title': 'Title baru', 'status': 'REPORTED'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.reported_a.refresh_from_db()
        self.assertEqual(self.reported_a.title, 'Jalan Rusak')

    def test_WF_05_laporan_resolved_read_only(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.put(
            f'/api/report/{self.resolved_a.id}/',
            {'title': 'Diubah', 'status': 'DRAFT'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.resolved_a.refresh_from_db()
        self.assertEqual(self.resolved_a.status, 'RESOLVED')

    def test_FT_01_membuat_laporan_dengan_data_lengkap(self):
        self.client.force_authenticate(user=self.warga_a)

        payload = {
            'title': 'Laporan Lampu Jalan Mati',
            'category': 'Infrastruktur',
            'description': 'Lampu di jalan utama padam.',
            'location': 'RT 01',
        }

        response = self.client.post('/api/report/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reporter'], self.warga_a.id)

    def test_FT_02_tolak_jika_judul_kosong(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.post(
            '/api/report/',
            {'title': '', 'category': 'Kebersihan', 'description': 'Sampah menumpuk', 'location': 'Blok A'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_FT_03_tolak_jika_deskripsi_kosong(self):
        self.client.force_authenticate(user=self.warga_a)

        response = self.client.post(
            '/api/report/',
            {'title': 'Pohon Tumbang', 'category': 'Fasilitas Umum', 'description': '', 'location': 'Jl. Protokol'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_FT_04_xss_disimpan_sebagai_string_literal(self):
        self.client.force_authenticate(user=self.warga_a)
        payload = {
            'title': 'Laporan XSS',
            'category': 'Keamanan',
            'description': '<script>alert("xss")</script>',
            'location': 'Lab Keamanan',
        }

        response = self.client.post('/api/report/', payload, format='json')

        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
        report = Report.objects.get(title='Laporan XSS')
        self.assertIn('script', report.description.lower())
