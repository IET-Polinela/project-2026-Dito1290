from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from .models import Report


# LIST
class ReportListView(ListView):
    model = Report
    template_name = 'report_list.html'
    context_object_name = 'reports'


# DETAIL
class ReportDetailView(DetailView):
    model = Report
    template_name = 'report_detail.html'


# CREATE
class ReportCreateView(CreateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'report_form.html'
    success_url = reverse_lazy('report_list')


# UPDATE
class ReportUpdateView(UpdateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'report_form.html'
    success_url = reverse_lazy('report_list')


# DELETE
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'report_confirm_delete.html'
    success_url = reverse_lazy('report_list')


# UPDATE STATUS (WORKFLOW)
class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()
        return redirect('report_list')