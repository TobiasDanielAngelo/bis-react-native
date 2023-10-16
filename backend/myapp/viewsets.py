import operator
import re
from datetime import date
from functools import reduce

from django.db.models import Q, Value, Case, When, CharField
from django.db.models.functions import Concat
from knox.auth import TokenAuthentication
from rest_framework import response, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import (
    Category,
    Mechanic,
    Motor,
    Product,
    SparePart,
    Transaction,
    MyUser,
    TransactionLineItem,
)
from .serializers import (
    CategorySerializer,
    MechanicSerializer,
    MotorSerializer,
    ProductSerializer,
    SparePartSerializer,
    TransactionItemSerializer,
    UserSerializer,
    TransactionSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Product.objects.all().annotate(
        name1=Concat(
            "part__name",
            Value(" "),
            "description",
            Value(" "),
            "motors",
            Value(" "),
            "brand",
            Case(When(is_orig=True, then=Value("ORIG.")), default=Value("SEMI.")),
        ),
        name2=Concat(
            "part__name",
            Value(" "),
            "description",
            Value(" "),
            "brand",
        ),
    )

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        if params.get("q"):
            if len(f'{params["q"]}') > 4:
                pattern = r"\W+"
                list_queries = re.split(pattern, params["q"])
                print(list_queries)
                queryset = self.filter_queryset(self.get_queryset()).filter(
                    reduce(
                        operator.and_,
                        (Q(name1__icontains=x) for x in list_queries),
                    )
                )
            else:
                queryset = None
        elif params.get("x"):
            pattern = r"\W+"
            list_queries = re.split(pattern, params["x"])
            queryset = self.filter_queryset(self.get_queryset()).filter(
                reduce(
                    operator.and_,
                    (Q(name2__icontains=x) for x in list_queries),
                )
            )
            if params.get("motors"):
                pattern = r"\W+"
                list_queries = re.split(pattern, params["motors"])
                queryset = queryset.filter(
                    reduce(
                        operator.or_,
                        (
                            Q(motors__icontains=Motor.objects.get(pk=x).name)
                            for x in list_queries
                        ),
                    )
                )
        elif params.get("part"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                part=params["part"]
            )
        else:
            queryset = None
            # queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Category.objects.all()


class MotorViewSet(viewsets.ModelViewSet):
    serializer_class = MotorSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Motor.objects.all()


class SparePartViewSet(viewsets.ModelViewSet):
    serializer_class = SparePartSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = SparePart.objects.all()


class MechanicViewSet(viewsets.ModelViewSet):
    serializer_class = MechanicSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Mechanic.objects.all()


class MyUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = MyUser.objects.all()


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


class PurchasePartViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.filter(category__title="Purchase Parts")
    permission_classes = [
        AllowAny,
        # IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        if params.get("mode"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                description__icontains=params["mode"],
            )
        else:
            queryset = None
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
        if params.get("prod"):
            q1 = (
                self.filter_queryset(self.get_queryset())
                .filter(
                    transaction__category__title="Point of Sales",
                    description__icontains="SKU" + params["prod"],
                )
                .exclude(transaction__description__icontains="Not Paid")
            )
            q2 = self.filter_queryset(self.get_queryset()).filter(
                transaction__category__title="Point of Sales",
                description__icontains="RSI" + params["prod"],
            )
            q3 = (
                self.filter_queryset(self.get_queryset())
                .filter(
                    transaction__category__title="Purchase Parts",
                    description__icontains="PPU" + params["prod"],
                )
                .exclude(
                    transaction__description__icontains="Editing",
                )
                .exclude(
                    transaction__description__icontains="Processing",
                )
            )
            qty1 = sum(x.quantity for x in q1)
            qty2 = sum(x.quantity for x in q2)
            qty3 = sum(x.quantity for x in q3)

            return response.Response({"quantity": (qty3 + qty2 - qty1)})
        elif params.get("q"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                transaction__category__title="Point of Sales",
                description__icontains=params["q"],
            )
        else:
            queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PurchaseItemViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionItemSerializer
    queryset = TransactionLineItem.objects.all()
    permission_classes = [
        # AllowAny,
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        queryset = self.filter_queryset(self.get_queryset()).filter(
            transaction__category__title="Purchase Parts",
        )
        if params.get("q"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                description__icontains=params["q"],
            )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
