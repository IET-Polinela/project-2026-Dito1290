from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def welcome(request):
    return HttpResponse("Selamat Datang Dito")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('welcome/', welcome),
    path('', include('main_app.urls')),
    path('about/', include('about.urls')),
    path('contacts/', include('contacts.urls')),  
]