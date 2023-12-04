import operator
import re
from datetime import date, datetime
from functools import reduce

from django.db.models import (
    F,
    Q,
    Sum,
    OuterRef,
    Subquery,
    IntegerField,
    Value,
    Case,
    When,
)

from django.db.models.functions import Concat
from knox.auth import TokenAuthentication
from rest_framework import response, viewsets
from rest_framework.permissions import IsAuthenticated
from .helpers import get_dates_start

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
        IsAuthenticated,
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
    )

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
        if params.get("get_printables"):
            queryset = queryset.filter(print_count__gt=0)
        if params.get("ids"):
            list_to_include = params["ids"].split(" ")
            queryset = queryset.filter(
                reduce(
                    operator.or_,
                    (Q(id=x) for x in list_to_include),
                )
            )
        if params.get("q"):
            ids = []
            if len(f'{params["q"]}') > 4:
                pattern = r"\W+"
                list_queries = re.split(pattern, params["q"])
                print(list_queries)
                queryset = queryset.filter(
                    reduce(
                        operator.and_,
                        (Q(name1__icontains=x) for x in list_queries),
                    )
                )
                ids = list(queryset.values_list("id", flat=True))
            return response.Response({"ids": ids})

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Category.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [
        IsAuthenticated,
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
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Motor.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class SparePartViewSet(viewsets.ModelViewSet):
    serializer_class = SparePartSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = SparePart.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class MechanicViewSet(viewsets.ModelViewSet):
    serializer_class = MechanicSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Mechanic.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class MyUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [
        IsAuthenticated,
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
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Sale.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(datetime_opened__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        if params.get("range"):
            print(get_dates_start(params["range"]))
            queryset = queryset.filter(
                datetime_opened__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                total_discount=Sum("discount"),
            )
            return response.Response(analytics)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Purchase.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(datetime_opened__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PayableViewSet(viewsets.ModelViewSet):
    serializer_class = PayableSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Payable.objects.all()


class ReceivableViewSet(viewsets.ModelViewSet):
    serializer_class = ReceivableSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Receivable.objects.all()


class SalesItemViewSet(viewsets.ModelViewSet):
    serializer_class = SalesItemSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = SalesItem.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(sales__datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(sales__datetime_opened__lte=params["end_date"])
        if params.get("product"):
            queryset = queryset.filter(product=params["product"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        if params.get("range"):
            queryset = queryset.filter(
                sales__datetime_opened__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                gross_sales_from_goods_paid=Sum(
                    F("quantity") * F("selling_price"), filter=Q(sales__status="3")
                ),
                gross_sales_from_goods_validating=Sum(
                    F("quantity") * F("selling_price"), filter=Q(sales__status="2")
                ),
                gross_sales_from_goods_unpaid=Sum(
                    F("quantity") * F("selling_price"), filter=Q(sales__status="1")
                ),
                sales_profit_from_goods_paid=Sum(
                    F("quantity")
                    * (
                        F("selling_price")
                        - (F("product__purchase_price") / F("product__piece_count"))
                    ),
                    filter=Q(sales__status="3"),
                ),
                sales_profit_from_goods_validating=Sum(
                    F("quantity")
                    * (
                        F("selling_price")
                        - (F("product__purchase_price") / F("product__piece_count"))
                    ),
                    filter=Q(sales__status="2"),
                ),
                sales_profit_from_goods_unpaid=Sum(
                    F("quantity")
                    * (
                        F("selling_price")
                        - (F("product__purchase_price") / F("product__piece_count"))
                    ),
                    filter=Q(sales__status="1"),
                ),
            )
            return response.Response(analytics)

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CountItemViewSet(viewsets.ModelViewSet):
    serializer_class = CountItemSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)
    queryset = CountItem.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(datetime_counted__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(datetime_counted__gte=params["end_date"])
        if params.get("product"):
            queryset = queryset.filter(product=params["product"])
        if params.get("range"):
            queryset = queryset.filter(
                datetime_counted__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                lost_gained_goods=Sum(
                    F("quantity")
                    * (F("product__sell_price") / F("product__piece_count")),
                ),
            )
            return response.Response(analytics)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class LaborItemViewSet(viewsets.ModelViewSet):
    serializer_class = LaborItemSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = LaborItem.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(sales__datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(sales__datetime_opened__lte=params["end_date"])
        if params.get("product"):
            queryset = queryset.filter(product=params["product"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        if params.get("range"):
            queryset = queryset.filter(
                sales__datetime_opened__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                receive_labor_paid=Sum("amount_received", filter=Q(sales__status="3")),
                receive_labor_validating=Sum(
                    "amount_received", filter=Q(sales__status="2")
                ),
                receive_labor_unpaid=Sum(
                    "amount_received", filter=Q(sales__status="1")
                ),
                returned_labor=Sum("amount_returned"),
                owed_labor=Sum("amount_owed", filter=~Q(mechanic=1)),
            )
            return response.Response(analytics)

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class ReturnedItemViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnedItemSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = ReturnedItem.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(sales__datetime_opened__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(sales__datetime_opened__lte=params["end_date"])
        if params.get("product"):
            queryset = queryset.filter(product=params["product"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        if params.get("range"):
            queryset = queryset.filter(
                sales__datetime_opened__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                returned_sales_from_goods=Sum(F("quantity") * F("selling_price")),
                returned_sales_from_goods_profit=Sum(
                    F("quantity")
                    * (
                        F("selling_price")
                        - (F("product__purchase_price") / F("product__piece_count"))
                    )
                ),
            )
            return response.Response(analytics)

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Transaction.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(datetime_transacted__gte=params["start_date"])
        if params.get("end_date"):
            queryset = queryset.filter(datetime_transacted__lte=params["end_date"])
        if params.get("is_active"):
            activity = params["is_active"] == "true"
            queryset = queryset.filter(is_active=activity)
        if params.get("category"):
            queryset = queryset.filter(category=params["category"])
        if params.get("range"):
            queryset = queryset.filter(
                datetime_transacted__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                adjustments_added=Sum("amount", filter=Q(category=54, transmitter=11)),
                adjustments_deducted=Sum("amount", filter=Q(category=54, receiver=11)),
                adjustments_added_stocks=Sum(
                    "amount", filter=Q(category=53, transmitter=11)
                ),
                adjustments_deducted_stocks=Sum(
                    "amount", filter=Q(category=53, receiver=11)
                ),
                replenished_stocks=Sum("amount", filter=Q(category=52)),
                parts_expenses=Sum("amount", filter=Q(category=13)),
                other_expenses=Sum("amount", filter=Q(receiver=16)),
                other_incomes=Sum("amount", filter=Q(transmitter=16)),
            )
            return response.Response(analytics)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class PurchaseItemViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseItemSerializer
    queryset = PurchaseItem.objects.all()
    permission_classes = [
        IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("start_date"):
            queryset = queryset.filter(
                purchase__datetime_closed__gte=params["start_date"]
            )
        if params.get("end_date"):
            queryset = queryset.filter(
                purchase__datetime_closed__gte=params["end_date"]
            )
        if params.get("product"):
            queryset = queryset.filter(product=params["product"])
        if params.get("range"):
            queryset = queryset.filter(
                purchase__datetime_closed__gte=get_dates_start(params["range"])
            )
        if params.get("analytics"):
            analytics = queryset.aggregate(
                total_purchased_goods_cost=Sum(
                    F("quantity") * F("purchase_price"),
                    filter=Q(purchase__status="4"),
                ),
                total_purchased_goods_worth=Sum(
                    F("quantity")
                    * (F("product__sell_price") / F("product__piece_count")),
                    filter=Q(purchase__status="4"),
                ),
            )
            return response.Response(analytics)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
