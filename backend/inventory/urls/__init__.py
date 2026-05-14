from django.urls import path, include

urlpatterns = [
    path("", include("inventory.urls.overview_urls")),
    path("", include("inventory.urls.adjustment_urls")),
    path("", include("inventory.urls.action_urls")),
]
