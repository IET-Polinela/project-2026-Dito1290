from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import CitizenRegistrationForm, ProfileForm
from .models import CustomUser

class CitizenRegisterView(CreateView):
    form_class = CitizenRegistrationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        messages.success(self.request, "Registrasi berhasil! Silakan login.")
        return super().form_valid(form)

class ProfileView(LoginRequiredMixin, UpdateView):
    model = CustomUser
    form_class = ProfileForm
    template_name = 'registration/profile.html'
    success_url = reverse_lazy('profile')

    def get_object(self):
        return self.request.user

    def form_valid(self, form):
        messages.success(self.request, "Profil berhasil diperbarui.")
        return super().form_valid(form)

class CustomLoginView(LoginView):
    template_name = 'registration/login.html'
    
    def form_valid(self, form):
        messages.success(self.request, f"Selamat datang kembali, {self.request.user.username}!")
        return super().form_valid(form)

class CustomLogoutView(LogoutView):
    def dispatch(self, request, *args, **kwargs):
        messages.info(request, "Anda telah logout.")
        return super().dispatch(request, *args, **kwargs)