import operator
import re
from datetime import date
from functools import reduce

from django.db.models import (
    Q,
    Sum,
    OuterRef,
    Subquery,
    IntegerField,
)
from knox.auth import TokenAuthentication
from rest_framework import response, viewsets
from rest_framework.permissions import AllowAny

from .models import (
    Account,
    Category,
    Mechanic,
    Motor,
    MyUser,
    Product,
    SparePart,
    Transaction,
    PurchaseItem,
    Sale,
    Payable,
    Receivable,
    Purchase,
    SalesItem,
    LaborItem,
    ReturnedItem,
    CountItem,
)
from .serializers import (
    AccountSerializer,
    CategorySerializer,
    MechanicSerializer,
    MotorSerializer,
    ProductSerializer,
    SparePartSerializer,
    PurchaseItemSerializer,
    SalesItemSerializer,
    LaborItemSerializer,
    ReturnedItemSerializer,
    PayableSerializer,
    ReceivableSerializer,
    PurchaseSerializer,
    TransactionSerializer,
    UserSerializer,
    SaleSerializer,
    CountItemSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [
        AllowAny,
    ]

    authentication_classes = (TokenAuthentication,)

    queryset = Product.objects.all()

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        queryset = self.filter_queryset(self.get_queryset())
        q1 = queryset.annotate(r=Sum("sales_product__quantity")).filter(
            pk=OuterRef("pk")
        )
        q2 = queryset.annotate(r=Sum("returned_product__quantity")).filter(
            pk=OuterRef("pk")
        )
        q3 = queryset.annotate(r=Sum("purchase_product__quantity")).filter(
            pk=OuterRef("pk")
        )
        q4 = queryset.annotate(r=Sum("count_product__quantity")).filter(
            pk=OuterRef("pk")
        )
        queryset = queryset.annotate(
            sold=Subquery(q1.values("r"), output_field=IntegerField()),
            returned=Subquery(q2.values("r"), output_field=IntegerField()),
            purchased=Subquery(q3.values("r"), output_field=IntegerField()),
            counted=Subquery(q4.values("r"), output_field=IntegerField()),
        )
        if params.get("get_id_range"):
            resp = {
                "max_id": queryset.latest("id").id,
                "min_id": queryset.earliest("id").id,
            }
            return response.Response(resp)
        if params.get("incl"):
            list_to_include = params["incl"].split(" ")
            queryset = queryset.filter(
                reduce(
                    operator.or_,
                    (Q(id=x) for x in list_to_include),
                )
            )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Category.objects.all()


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Account.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("end_date"):
            q1 = queryset.annotate(
                r=Sum(
                    "transaction_transmitter__amount",
                    filter=Q(
                        transaction_transmitter__datetime_transacted__lte=params[
                            "end_date"
                        ]
                    ),
                ),
            ).filter(pk=OuterRef("pk"))
            q2 = queryset.annotate(
                r=Sum(
                    "transaction_receiver__amount",
                    filter=Q(
                        transaction_receiver__datetime_transacted__lte=params[
                            "end_date"
                        ]
                    ),
                ),
            ).filter(pk=OuterRef("pk"))
        else:
            q1 = queryset.annotate(
                r=Sum("transaction_transmitter__amount"),
            ).filter(pk=OuterRef("pk"))
            q2 = queryset.annotate(
                r=Sum("transaction_receiver__amount"),
            ).filter(pk=OuterRef("pk"))
        queryset = queryset.annotate(
            transmitted=Subquery(q1.values("r"), output_field=IntegerField()),
            received=Subquery(q2.values("r"), output_field=IntegerField()),
        )
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class MotorViewSet(viewsets.ModelViewSet):
    serializer_class = MotorSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Motor.objects.all()


class SparePartViewSet(viewsets.ModelViewSet):
    serializer_class = SparePartSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = SparePart.objects.all()


class MechanicViewSet(viewsets.ModelViewSet):
    serializer_class = MechanicSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Mechanic.objects.all()


class MyUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = MyUser.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("userid"):
            queryset = queryset.filter(user_id=params["userid"])
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Sale.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset.filter(datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset.filter(datetime_opened__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Purchase.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset.filter(datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset.filter(datetime_opened__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PayableViewSet(viewsets.ModelViewSet):
    serializer_class = PayableSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Payable.objects.all()


class ReceivableViewSet(viewsets.ModelViewSet):
    serializer_class = ReceivableSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Receivable.objects.all()


class SalesItemViewSet(viewsets.ModelViewSet):
    serializer_class = SalesItemSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = SalesItem.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset.filter(datetime_added__gte=params["start_date"])
        if params.get("end_date"):
            queryset.filter(datetime_added__lte=params["end_date"])
        if params.get("product"):
            queryset.filter(product=params["product"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CountItemViewSet(viewsets.ModelViewSet):
    serializer_class = CountItemSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)
    queryset = CountItem.objects.all()


class LaborItemViewSet(viewsets.ModelViewSet):
    serializer_class = LaborItemSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = LaborItem.objects.all()


class ReturnedItemViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnedItemSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = ReturnedItem.objects.all()


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Transaction.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset.filter(datetime_transacted__gte=params["start_date"])
        if params.get("end_date"):
            queryset.filter(datetime_transacted__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset.filter(is_active=activity)
        if params.get("category"):
            queryset.filter(category=params["category"])
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PurchaseItem2ViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseItemSerializer
    queryset = PurchaseItem.objects.all()
    permission_classes = [
        AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)
