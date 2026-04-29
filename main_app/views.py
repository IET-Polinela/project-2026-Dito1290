from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .models import Report

# --- MIXIN CUSTOM UNTUK PROTEKSI ADMIN ---
class AdminRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        # Mengecek apakah user login dan is_admin bernilai True
        return self.request.user.is_authenticated and self.request.user.is_admin

    def handle_no_permission(self):
        # Jika bukan admin, beri pesan error dan kembalikan ke daftar laporan
        messages.error(self.request, "Akses Ditolak! Hanya Admin yang boleh melakukan aksi ini.")
        return redirect('report_list')

def home(request):
    return render(request, 'main_app/home.html')

class ReportListView(View):
    template_name = 'main_app/report_list.html'
    ajax_template_name = 'main_app/report_list_ajax.html'

    def get(self, request):
        query = request.GET.get('q', '')
        reports = self._get_reports(query)

        context = {
            'reports': reports,
            'query': query,
        }

        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return render(request, self.ajax_template_name, context)

        return render(request, self.template_name, context)

    def _get_reports(self, query):
        if query:
            reports = Report.objects.filter(
                title__icontains=query
            ) | Report.objects.filter(
                description__icontains=query
            ) | Report.objects.filter(
                category__icontains=query
            ) | Report.objects.filter(
                location__icontains=query
            )
        else:
            reports = Report.objects.all()

        return reports.order_by('-created_at')

class ReportSearchView(View):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        reports = ReportListView()._get_reports(query)
        results = [
            {
                'id': report.id,
                'title': report.title,
                'location': report.location,
                'status': report.status,
            }
            for report in reports
        ]
        return JsonResponse({
            'query': query,
            'count': len(results),
            'results': results,
        })

class ReportDetailView(View):
    def get(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        
        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            data = {
                'id': report.id,
                'title': report.title,
                'category': report.category,
                'description': report.description,
                'location': report.location,
                'status': report.status,
                'created_at': report.created_at.strftime('%d %B %Y, %H:%M'),
            }
            return JsonResponse(data)
        
        # Regular HTML response
        context = {'report': report}
        return render(request, 'main_app/report_detail.html', context)

# Tambahkan AdminRequiredMixin di View yang harus diproteksi
class ReportCreateView(AdminRequiredMixin, CreateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'main_app/report_form.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil ditambahkan")
        return super().form_valid(form)

class ReportUpdateView(AdminRequiredMixin, UpdateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'main_app/report_form.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diupdate")
        return super().form_valid(form)

class ReportDeleteView(AdminRequiredMixin, DeleteView):
    model = Report
    template_name = 'main_app/report_confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, "Laporan berhasil dihapus")
        return super().delete(request, *args, **kwargs)

class ReportUpdateStatusView(AdminRequiredMixin, View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        report.status = request.POST.get('status')
        report.save()

        messages.success(request, "Status berhasil diubah")
        return redirect('report_detail', pk=pk)