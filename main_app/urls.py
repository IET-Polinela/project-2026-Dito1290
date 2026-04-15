from django.urls import path
from .views import *

urlpatterns = [
    path('', ReportListView.as_view(), name='report_list'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('create/', ReportCreateView.as_view(), name='report_create'),
    path('<int:pk>/update/', ReportUpdateView.as_view(), name='report_update'),
    path('<int:pk>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    path('<int:pk>/status/', ReportUpdateStatusView.as_view(), name='update_status'),
]