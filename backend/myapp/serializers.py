import json

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import (
    Account,
    Category,
    Mechanic,
    Motor,
    MyUser,
    Product,
    SparePart,
    Receivable,
    Payable,
    Transaction,
    SalesItem,
    LaborItem,
    ReturnedItem,
    Sale,
    Purchase,
    PurchaseItem,
    CountItem,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = [
            "user_id",
            "username",
            "privilege",
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = MyUser
        fields = ["username", "password", "token"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(
                request=self.context.get("request"),
                username=username,
                password=password,
            )
            if not user:
                raise serializers.ValidationError(
                    "Unable to login with provided credentials.", code="authorization"
                )
        else:
            raise serializers.ValidationError(
                "Must include username and password.", code="authorization"
            )

        data["user"] = user
        return super(LoginSerializer, self).validate(data)


class ProductSerializer(serializers.ModelSerializer):
    sold = serializers.IntegerField(read_only=True)
    returned = serializers.IntegerField(read_only=True)
    purchased = serializers.IntegerField(read_only=True)
    counted = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "piece_count",
            "unit",
            "description",
            "brand",
            "part",
            "motors",
            "datetime_added",
            "is_active",
            "location",
            "purchase_price",
            "sell_price",
            "min_quantity",
            "is_orig",
            "print_count",
            "datetime_updated",
            "sold",
            "returned",
            "purchased",
            "counted",
        ]


class MotorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motor
        fields = "__all__"


class AccountSerializer(serializers.ModelSerializer):
    transmitted = serializers.IntegerField(read_only=True)
    received = serializers.IntegerField(read_only=True)

    class Meta:
        model = Account
        fields = ["id", "name", "datetime_added", "transmitted", "received"]


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = "__all__"


class SparePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = SparePart
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class CountItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountItem
        fields = "__all__"


class SalesItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesItem
        fields = "__all__"


class LaborItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborItem
        fields = "__all__"


class ReturnedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnedItem
        fields = "__all__"


class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = "__all__"


class SaleSerializer(serializers.ModelSerializer):
    sales_item = SalesItemSerializer(many=True, required=False)
    returned_item = ReturnedItemSerializer(many=True, required=False)
    labor_item = LaborItemSerializer(many=True, required=False)

    class Meta:
        model = Sale
        fields = [
            "id",
            "to_print",
            "status",
            "payment",
            "customer_name",
            "datetime_opened",
            "datetime_closed",
            "is_active",
            "discount",
            "user_adder",
            "user_validator",
            "user_closer",
            "sales_item",
            "labor_item",
            "returned_item",
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    purchase_item = PurchaseItemSerializer(many=True, required=False)

    class Meta:
        model = Purchase
        fields = [
            "id",
            "supplier_name",
            "status",
            "datetime_opened",
            "datetime_closed",
            "is_active",
            "to_print",
            "user_adder",
            "user_closer",
            "purchase_item",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class ReceivableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receivable
        fields = [
            "id",
            "payment",
            "borrower_name",
            "description",
            "lent_amount",
            "datetime_opened",
            "datetime_due",
            "datetime_closed",
            "is_active",
            "user_opener",
            "user_closer",
        ]


class PayableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payable
        fields = [
            "id",
            "payment",
            "lender_name",
            "description",
            "borrowed_amount",
            "datetime_opened",
            "datetime_due",
            "datetime_closed",
            "is_active",
            "user_opener",
            "user_closer",
        ]
