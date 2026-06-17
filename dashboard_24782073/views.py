from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.db.models import Count, Q
from main_app.models import Report

# [TAMBAHAN LAB 14] Import decorator Spectacular
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

class DashboardView(TemplateView):
    template_name = 'dashboard/dashboard.html'

@extend_schema(
    summary="Ambil data statistik dashboard",
    description="Mengambil ringkasan distribusi status, kategori, dan laporan terbaru.",
    responses={200: OpenApiTypes.OBJECT}
)
def dashboard_data(request):
    # Distribusi status
    status_counts = Report.objects.values('status').annotate(count=Count('status')).order_by('status')
    status_data = [{'status': item['status'], 'total': item['count']} for item in status_counts]

    # Distribusi kategori
    category_counts = Report.objects.values('category').annotate(count=Count('category')).order_by('category')
    category_data = [{'category': item['category'], 'total': item['count']} for item in category_counts]

    # Laporan terbaru
    recent_reported = list(Report.objects.filter(status='REPORTED').order_by('-created_at')[:5].values('id', 'title', 'category', 'location', 'created_at'))
    recent_resolved = list(Report.objects.filter(status='RESOLVED').order_by('-created_at')[:5].values('id', 'title', 'category', 'location', 'created_at'))

    data = {'status': status_data, 'category': category_data, 'recent_reported': recent_reported, 'recent_resolved': recent_resolved}
    return JsonResponse(data)

@extend_schema(
    summary="Cari laporan",
    description="Mencari laporan berdasarkan judul, deskripsi, kategori, atau lokasi.",
    parameters=[OpenApiParameter(name='q', description='Kata kunci pencarian', type=OpenApiTypes.STR)],
    responses={200: OpenApiTypes.OBJECT}
)
def search_reports(request):
    query = request.GET.get('q', '').strip()
    if query:
        reports = Report.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query) |
            Q(category__icontains=query) | Q(location__icontains=query)
        ).order_by('-created_at')
    else:
        reports = Report.objects.none()

    data = list(reports.values('id', 'title', 'category', 'location', 'status', 'created_at'))
    return JsonResponse({'reports': data})

@extend_schema(
    summary="Detail laporan",
    description="Mengambil detail informasi satu laporan berdasarkan ID.",
    responses={200: OpenApiTypes.OBJECT}
)
def report_detail(request, report_id):
    report = get_object_or_404(Report, id=report_id)
    data = {
        'id': report.id,
        'title': report.title,
        'category': report.category,
        'description': report.description,
        'location': report.location,
        'status': report.status,
        'created_at': report.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    }
    return JsonResponse(data)