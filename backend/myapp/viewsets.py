from rest_framework import viewsets
from knox.auth import TokenAuthentication
from datetime import date
from .serializers import ProductSerializer, TransactionSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import response
from .models import Product, Transaction, Category


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Product.objects.all()


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Category.objects.all()


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Transaction.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        expense_categories = [
            x["pk"] for x in Category.objects.filter(nature="1").values("pk")
        ]
        queryset = self.filter_queryset(self.get_queryset()).filter(
            category__in=expense_categories
        )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        income_categories = [
            x["pk"] for x in Category.objects.filter(nature="2").values("pk")
        ]
        queryset = self.filter_queryset(self.get_queryset()).filter(
            category__in=income_categories
        )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PointOfSaleViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        if params.get("date"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                category=Category.objects.filter(pk=1).first(),
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
        if params.get("active"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                category=Category.objects.filter(pk=1).first(),
                description__icontains="Open",
            )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
