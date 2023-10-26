import operator
import re
from datetime import date
from functools import reduce

from django.db.models import Case, CharField, Q, Value, When
from django.db.models.functions import Concat
from knox.auth import TokenAuthentication
from rest_framework import response, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import (
    Account,
    Category,
    Mechanic,
    Motor,
    MyUser,
    Product,
    SparePart,
    Transaction,
    TransactionLineItem,
)
from .serializers import (
    AccountSerializer,
    CategorySerializer,
    MechanicSerializer,
    MotorSerializer,
    ProductSerializer,
    SparePartSerializer,
    TransactionItemSerializer,
    TransactionSerializer,
    UserSerializer,
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
        elif params.get("loc"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                location=params["loc"]
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


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [
        IsAuthenticated,
        # AllowAny,
    ]
    authentication_classes = (TokenAuthentication,)

    queryset = Account.objects.all()


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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        params = self.request.query_params
        if params.get("userid"):
            print(params["userid"])
            queryset = queryset.filter(user_id=params["userid"])
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


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
        params = self.request.query_params
        if params.get("todaysreport"):
            queryset = queryset.filter(
                category__title="Cash Report",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
        elif params.get("cashregister"):
            in_sales = 0
            in_labor1 = 0
            in_labor2 = 0
            out_labor2 = 0
            out_gcash = 0
            out_discount = 0
            in_pcv = 0
            out_etc = 0

            q1 = queryset.filter(
                category__title="Point of Sales",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
            q2 = queryset.filter(
                category__title="Account to Account",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
            for q in q1:
                print(q)

        elif params.get("transfer") and params.get("date"):
            queryset = queryset.filter(
                category__title="Account to Account",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                datetime_transacted__day=(params["date"])[6:8],
            )
        elif params.get("counting"):
            queryset = queryset.filter(
                category__title="Inventory Check", description__icontains="Pending"
            )
        elif params.get("inventory") and params.get("date"):
            q1 = queryset.filter(
                category__title="Inventory Check",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
            )
            q2 = queryset = queryset.filter(
                category__title="Purchase Parts",
                datetime_transacted__year=(params["date"])[0:4],
                datetime_transacted__month=(params["date"])[4:6],
                description__icontains="Closed",
            )
            queryset = q1 | q2
        else:
            queryset = None
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

        if params.get("cat") and params.get("start") and params.get("end"):
            if params["cat"] == "Lend Money":
                queryset = self.filter_queryset(self.get_queryset()).filter(
                    category__title=params["cat"],
                )
            else:
                queryset = self.filter_queryset(self.get_queryset()).filter(
                    category__title=params["cat"],
                    datetime_transacted__gte=params["start"],
                    datetime_transacted__lte=params["end"],
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
        elif params.get("active"):
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
        # AllowAny,
        IsAuthenticated,
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
        AllowAny,
        # IsAuthenticated,
    ]
    authentication_classes = (TokenAuthentication,)

    def list(self, request, *args, **kwargs):
        params = self.request.query_params
        queryset = self.filter_queryset(self.get_queryset())
        if params.get("cashregister"):
            queryset = None
        elif params.get("prod"):
            q1 = queryset.filter(
                transaction__category__title="Point of Sales",
                description__icontains="SKU" + params["prod"] + "***",
            ).exclude(transaction__description__icontains="Not Paid")

            q2 = queryset.filter(
                transaction__category__title="Point of Sales",
                description__icontains="RSI" + params["prod"] + "***",
            )
            q3 = queryset.filter(
                transaction__category__title="Purchase Parts",
                description__icontains="PPU" + params["prod"] + "***",
                transaction__description__icontains="Closed",
                remarks="",
            )
            q4 = queryset.filter(
                transaction__category__title="Inventory Check",
                description__icontains="ADU" + params["prod"] + "***",
            )
            q5 = queryset.filter(
                transaction__category__title="Inventory Check",
                description__icontains="SBU" + params["prod"] + "***",
            )

            qty1 = sum(x.quantity for x in q1)
            qty2 = sum(x.quantity for x in q2)
            qty3 = sum(x.quantity for x in q3)
            qty4 = sum(x.quantity for x in q4)
            qty5 = sum(x.quantity for x in q5)

            quantities = {
                "quantity": (qty3 + qty4 + qty2 - qty5 - qty1),
                "sold": qty1,
                "returned": qty2,
                "purchased": qty3,
                "gained": qty4,
                "lost": qty5,
            }
            return response.Response(quantities)
        elif params.get("totalstock") and params.get("date"):
            print(params["date"])
            queryset = self.filter_queryset(self.get_queryset()).filter(
                transaction__datetime_transacted__lt=params["date"]
            )
            total = 0
            all_product_prices = Product.objects.values("sell_price", "pk")
            for p in all_product_prices:
                q1 = queryset.filter(
                    transaction__category__title="Point of Sales",
                    description__icontains="SKU" + f'{p["pk"]}' + "***",
                ).exclude(transaction__description__icontains="Not Paid")

                q2 = queryset.filter(
                    transaction__category__title="Point of Sales",
                    description__icontains="RSI" + f'{p["pk"]}' + "***",
                )
                q3 = queryset.filter(
                    transaction__category__title="Purchase Parts",
                    description__icontains="PPU" + f'{p["pk"]}' + "***",
                    transaction__description__icontains="Closed",
                    remarks="",
                )
                q4 = queryset.filter(
                    transaction__category__title="Inventory Check",
                    description__icontains="ADU" + f'{p["pk"]}' + "***",
                )
                q5 = queryset.filter(
                    transaction__category__title="Inventory Check",
                    description__icontains="SBU" + f'{p["pk"]}' + "***",
                )
                qty1 = sum(x.quantity for x in q1)
                qty2 = sum(x.quantity for x in q2)
                qty3 = sum(x.quantity for x in q3)
                qty4 = sum(x.quantity for x in q4)
                qty5 = sum(x.quantity for x in q5)
                total += (qty3 + qty4 + qty2 - qty5 - qty1) * p["sell_price"]
            return response.Response({"total": total})
        elif params.get("account") and params.get("date"):
            queryset = self.filter_queryset(self.get_queryset()).filter(
                transaction__datetime_transacted__lt=params["date"],
                transaction__category__title="Account to Account",
            )
            if params["account"] != "allcash":
                q1 = queryset.filter(
                    transaction__transmitter="ACCT" + params["account"],
                )
                q2 = queryset.filter(
                    transaction__receiver="ACCT" + params["account"],
                )
            else:
                q1 = queryset.filter(
                    transaction__receiver="ACCT11",
                )
                q2 = queryset.filter(
                    transaction__transmitter="ACCT11",
                )
            qty1 = sum(x.unit_amount for x in q1)
            qty2 = sum(x.unit_amount for x in q2)

            return response.Response({"total": qty2 - qty1})

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
