from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from usermanagement_24782073.views import CustomLoginView, CustomLogoutView, CitizenRegisterView

def welcome(request):
    return HttpResponse("Selamat Datang Dito")

def favicon(request):
    return HttpResponse(status=204)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('welcome/', welcome),

    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),

    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('register/', CitizenRegisterView.as_view(), name='register'),

    path('favicon.ico', favicon),
]