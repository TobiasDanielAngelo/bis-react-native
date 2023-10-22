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
    TransactionLineItem,
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
    class Meta:
        model = Product
        fields = "__all__"


class MotorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motor
        fields = "__all__"


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"


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
        fields = ["pk", "title", "nature", "logo"]


class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionLineItem
        fields = "__all__"


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
