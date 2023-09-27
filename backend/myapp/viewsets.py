import operator
import re
from datetime import date
from functools import reduce

from django.db.models import Q
from knox.auth import TokenAuthentication
from rest_framework import response, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Category, Product, Transaction, TransactionLineItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    TransactionItemSerializer,
    TransactionSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Product.objects.all()

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        if params.get("q"):
            if len(f'{params["q"]}') > 4:
                pattern = r"\W+"
                list_queries = re.split(pattern, params["q"])
                print(list_queries)
                # queryset = None
                queryset = self.filter_queryset(self.get_queryset()).filter(
                    #     description__icontains=params["q"]
                    reduce(
                        operator.and_,
                        (Q(description__icontains=x) for x in list_queries),
                    )
                )
            else:
                queryset = None

        else:
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        params = self.request.query_params
        return response.Response(serializer.data)


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
        params = self.request.query_params

        if params.get("cat"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                category__title=params["cat"]
            )
        elif params.get("date"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                category__in=expense_categories,
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
        else:
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
                category__title="Point of Sales",
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


class POSItemViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionItemSerializer
    queryset = TransactionLineItem.objects.all()
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        if params.get("q"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                transaction__category__title="Point of Sales",
                description__icontains=params["q"],
            )
        else:
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
