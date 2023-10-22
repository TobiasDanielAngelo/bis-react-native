from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid


class MyUser(AbstractUser):
    PRIVILEGE_CHOICES = (
        ("1", "Level 1"),
        ("2", "Level 2"),
        ("3", "Level 3"),
    )
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    privilege = models.CharField(max_length=20, choices=PRIVILEGE_CHOICES, default="1")
    date_joined = models.DateTimeField(default=timezone.now)


class Mechanic(models.Model):
    name = models.CharField(max_length=20, default="")
    color = models.CharField(max_length=20, default="gray")


class Motor(models.Model):
    name = models.CharField(max_length=20, default="")
    maker = models.CharField(max_length=20, default="", blank=True)


class Account(models.Model):
    name = models.CharField(max_length=20, default="")
    datetime_added = models.DateTimeField(default=timezone.now, blank=True)

    def __str__(self):
        return f"Acct#{self.pk}"


class SparePart(models.Model):
    name = models.CharField(max_length=30, default="")
    is_motor_shown = models.BooleanField(default=True)
    is_semi_shown = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}"


class Product(models.Model):
    piece_count = models.IntegerField(validators=[MinValueValidator(1)], default=1)
    unit = models.CharField(max_length=10, default="pcs")
    description = models.CharField(max_length=50, default="", blank=True)
    brand = models.CharField(max_length=20, default="", blank=True)
    part = models.ForeignKey(
        SparePart, on_delete=models.CASCADE, related_name="product_part", null=True
    )
    motors = models.CharField(max_length=1000, default="", blank=True)
    generic = models.CharField(max_length=200, default="", blank=True)
    datetime_added = models.DateTimeField(default=timezone.now, blank=True)
    is_active = models.BooleanField(default=True)
    location = models.CharField(max_length=30)
    purchase_price = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    sell_price = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    min_quantity = models.IntegerField(validators=[MinValueValidator(0)], default=1)
    is_orig = models.BooleanField(default=False)
    print_count = models.IntegerField(validators=[MinValueValidator(0)], default=0)

    def __str__(self):
        return f"{self.generic}"


class ProductImageLineItem(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="product_image"
    )
    image = models.ImageField(blank=True, upload_to="images")


class Category(models.Model):
    CategoryChoices = (
        ("1", "Outgoing"),
        ("2", "Incoming"),
        ("3", "Transfer"),
    )
    title = models.CharField(max_length=30, default="", unique=True)
    nature = models.CharField(choices=CategoryChoices, max_length=20, default="3")
    logo = models.CharField(max_length=30, default="star")

    def __str__(self):
        return f"{self.title}"


class Transaction(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name="transaction_category",
        null=True,
    )
    encoder = models.ForeignKey(
        MyUser, on_delete=models.SET_NULL, null=True, related_name="transaction_encoder"
    )
    datetime_transacted = models.DateTimeField(default=timezone.now)
    description = models.CharField(max_length=200, default="")
    transmitter = models.CharField(max_length=30)
    receiver = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.description}"


class TransactionLineItem(models.Model):
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="particular_transaction"
    )
    description = models.CharField(max_length=200, default="")
    remarks = models.CharField(max_length=200, default="", blank=True)
    quantity = models.IntegerField(validators=[MinValueValidator(0)], default=1)
    unit_amount = models.DecimalField(
        max_digits=15, decimal_places=2, validators=[MinValueValidator(0)]
    )

    def __str__(self):
        return "%d of %s @ %.2f" % (self.quantity, self.description, self.unit_amount)
