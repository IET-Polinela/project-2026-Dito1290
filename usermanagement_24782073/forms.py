from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CitizenRegistrationForm(UserCreationForm):
    phone = forms.CharField(max_length=15, required=False, label="Nomor Telepon")
    address = forms.CharField(widget=forms.Textarea, required=False, label="Alamat")
    
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name", "phone", "address")
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_admin = False
        user.is_member = True
        user.phone = self.cleaned_data.get('phone')
        user.address = self.cleaned_data.get('address')
        if commit:
            user.save()
        return user

class ProfileForm(UserChangeForm):
    password = None  # Remove password field from profile
    
    class Meta:
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name", "phone", "address")