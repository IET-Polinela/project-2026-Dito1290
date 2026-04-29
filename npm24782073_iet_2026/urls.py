from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from main_app.views import ReportSearchView
from usermanagement_24782073.views import CustomLoginView, CustomLogoutView, CitizenRegisterView, ProfileView

def welcome(request):
    return HttpResponse("Selamat Datang Dito")

def favicon(request):
    return HttpResponse(status=204)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('welcome/', welcome),
    path('reports/search/', ReportSearchView.as_view(), name='report_search'),

    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('dashboard/', include('dashboard_24782073.urls')),

    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('register/', CitizenRegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),

    path('favicon.ico', favicon),
]