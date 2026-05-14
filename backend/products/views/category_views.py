from rest_framework import generics
from rest_framework.permissions import AllowAny
from products.models import Category
from products.serializers import CategorySerializer
from accounts.permissions import IsStaffOrAdmin


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny]
        return [IsStaffOrAdmin()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsStaffOrAdmin]
