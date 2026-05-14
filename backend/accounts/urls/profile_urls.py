from django.urls import path
from accounts.views import ProfileView, ChangePasswordView

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]
