from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from django.views import View
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

class ReportListView(ListView):
    model = Report
    template_name = 'main_app/report_list.html'
    context_object_name = 'reports'

class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'

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