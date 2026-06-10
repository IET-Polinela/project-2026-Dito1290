from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from main_app.views import ReportSearchView
from usermanagement_24782073.views import CustomLoginView, CustomLogoutView, CitizenRegisterView, ProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from usermanagement_24782073.api_views import RegisterView


def welcome(request):
    return HttpResponse("Selamat Datang Dito")


def favicon(request):
    return HttpResponse(status=204)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('welcome/', welcome),
    path('favicon.ico', favicon),

    # ===== JWT Authentication =====
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ===== API Register Citizen =====
    path('api/register/', RegisterView.as_view(), name='api_register'),

    # ===== API Reports =====
    path('api/', include('main_app.api_urls')),

    # ===== Web Routes (tetap ada dari lab sebelumnya) =====
    path('reports/search/', ReportSearchView.as_view(), name='report_search'),
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),
    path('dashboard/', include('dashboard_24782073.urls')),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('register/', CitizenRegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
