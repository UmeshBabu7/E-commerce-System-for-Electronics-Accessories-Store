from .auth_views import CustomTokenObtainPairView, RegisterView, LogoutView
from .profile_views import ProfileView, ChangePasswordView
from .admin_views import UserListView, UserDetailView

__all__ = [
    "CustomTokenObtainPairView",
    "RegisterView",
    "LogoutView",
    "ProfileView",
    "ChangePasswordView",
    "UserListView",
    "UserDetailView",
]
