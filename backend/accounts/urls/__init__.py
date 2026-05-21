from django.urls import path, include

urlpatterns = [
    path("", include("accounts.urls.auth_urls")),
    path("", include("accounts.urls.profile_urls")),
    path("", include("accounts.urls.admin_urls")),
]
