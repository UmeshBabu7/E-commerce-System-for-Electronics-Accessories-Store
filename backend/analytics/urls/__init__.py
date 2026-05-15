from django.urls import path, include

urlpatterns = [
    path("", include("analytics.urls.dashboard_urls")),
    path("", include("analytics.urls.profit_urls")),
    path("", include("analytics.urls.report_urls")),
]
