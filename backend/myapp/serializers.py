import json

from django.contrib.auth import authenticate
from rest_framework import serializers

from .encoders import DecimalEncoder
from .models import (
    Account,
    Category,
    Mechanic,
    Motor,
    MyUser,
    Product,
    SparePart,
    Transaction,
    Receivable,
    Payable,
    Transaction2,
    TransactionLineItem,
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


class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionLineItem
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


class Transaction2Serializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction2
        fields = "__all__"


class ReceivableSerializer(serializers.ModelSerializer):
    # payment = Transaction2Serializer(many=True, required=False)

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
    # payment = Transaction2Serializer(many=True, required=False)

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


class TransactionSerializer(serializers.ModelSerializer):
    particular_transaction = TransactionItemSerializer(many=True)

    class Meta:
        model = Transaction
        fields = [
            "pk",
            "category",
            "encoder",
            "datetime_transacted",
            "description",
            "transmitter",
            "receiver",
            "particular_transaction",
        ]

    def create(self, validated_data):
        transaction_item_data = validated_data.pop("particular_transaction")
        transaction = Transaction.objects.create(**validated_data)
        obj = json.loads(json.dumps(transaction_item_data, cls=DecimalEncoder))
        for t in obj:
            TransactionLineItem.objects.create(
                transaction=transaction,
                description=t["description"],
                remarks=t["remarks"],
                quantity=t["quantity"],
                unit_amount=t["unit_amount"],
            )
        return transaction

    def update(self, instance, validated_data):
        instance.category = validated_data.get("category") or instance.category
        instance.encoder = validated_data.get("encoder") or instance.encoder
        instance.description = validated_data.get("description") or instance.description
        instance.transmitter = validated_data.get("transmitter") or instance.transmitter
        instance.receiver = validated_data.get("receiver") or instance.receiver
        instance.save()
        if validated_data.get("particular_transaction") is not None:
            transaction_item_data = validated_data.pop("particular_transaction")
            obj = json.loads(json.dumps(transaction_item_data, cls=DecimalEncoder))
            if transaction_item_data is not None:
                TransactionLineItem.objects.filter(transaction=instance).delete()
                for t in obj:
                    TransactionLineItem.objects.create(
                        transaction=instance,
                        description=t["description"],
                        remarks=t["remarks"],
                        quantity=t["quantity"],
                        unit_amount=t["unit_amount"],
                    )
        return instance
