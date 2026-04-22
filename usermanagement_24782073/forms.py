from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CitizenRegistrationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name")
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_admin = False
        user.is_member = True
        if commit:
            user.save()
        return user