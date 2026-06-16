from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('data/', views.dashboard_data, name='dashboard_data'),
    path('search/', views.search_reports, name='search_reports'),
    path('report/<int:report_id>/', views.report_detail, name='report_detail'),
]