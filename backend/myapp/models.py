import uuid

from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


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
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"


class Motor(models.Model):
    name = models.CharField(max_length=20, default="")
    maker = models.CharField(max_length=20, default="", blank=True)


class Account(models.Model):
    name = models.CharField(max_length=20, default="")
    datetime_added = models.DateTimeField(default=timezone.now, blank=True)

    def __str__(self):
        return f"{self.pk} - {self.name}"


class SparePart(models.Model):
    name = models.CharField(max_length=30, default="")
    is_motor_shown = models.BooleanField(default=True)
    is_semi_shown = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}"


class Product(models.Model):
    piece_count = models.IntegerField(validators=[MinValueValidator(1)], default=1)
    unit = models.CharField(max_length=10, default="pcs")
    description = models.CharField(max_length=200, default="", blank=True)
    brand = models.CharField(max_length=20, default="", blank=True)
    part = models.ForeignKey(
        SparePart, on_delete=models.CASCADE, related_name="product_part", null=True
    )
    motors = models.CharField(max_length=1000, default="", blank=True)
    datetime_added = models.DateTimeField(default=timezone.now, blank=True)
    is_active = models.BooleanField(default=True)
    location = models.CharField(max_length=30)
    purchase_price = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    sell_price = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    min_quantity = models.IntegerField(validators=[MinValueValidator(0)], default=1)
    is_orig = models.BooleanField(default=False)
    print_count = models.IntegerField(validators=[MinValueValidator(0)], default=0)
    datetime_updated = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.part} {self.description} {self.brand} {'ORIG.' if self.is_orig else 'SEMI.'} {self.motors[0:5]}"


class ProductImageLineItem(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="product_image"
    )
    image = models.ImageField(blank=True, upload_to="images")


class Category(models.Model):
    class Meta:
        verbose_name_plural = "categories"

    CategoryChoices = (
        ("1", "Expense"),
        ("2", "Income"),
        ("3", "Transfer"),
        ("4", "Payable"),
        ("5", "Receivable"),
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
        MyUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="transaction_encoder",
    )
    description = models.CharField(max_length=200, default="")
    transmitter = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="transaction_transmitter",
        blank=True,
        null=True,
    )
    receiver = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="transaction_receiver",
        blank=True,
        null=True,
    )
    amount = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    datetime_transacted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.description}"


class Purchase(models.Model):
    StatusChoices = (
        ("1", "EDIT"),
        ("2", "PEND"),
        ("3", "PROC"),
        ("4", "DONE"),
    )
    supplier_name = models.CharField(max_length=30, default="", blank=True)
    status = models.CharField(choices=StatusChoices, max_length=20, default="1")
    datetime_opened = models.DateTimeField(default=timezone.now)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    to_print = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    user_adder = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="purchase_user_adder",
        blank=True,
        null=True,
    )
    user_closer = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="purchase_user_closer",
        blank=True,
        null=True,
    )


class Receivable(models.Model):
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_receivable",
    )
    borrower_name = models.CharField(max_length=30, default="", blank=True)
    lent_amount = models.DecimalField(
        max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    description = models.CharField(max_length=30, default="", blank=True)
    datetime_opened = models.DateTimeField(default=timezone.now)
    datetime_due = models.DateTimeField(blank=True, null=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    user_opener = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="receivable_user_adder",
        blank=True,
        null=True,
    )
    user_closer = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="receivable_user_closer",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.borrower_name} - {self.description}"


class Payable(models.Model):
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_payable",
    )
    lender_name = models.CharField(max_length=30, default="", blank=True)
    datetime_opened = models.DateTimeField(default=timezone.now)
    datetime_due = models.DateTimeField(blank=True, null=True)
    description = models.CharField(max_length=30, default="", blank=True)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    borrowed_amount = models.DecimalField(
        max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    is_active = models.BooleanField(default=True)
    user_opener = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="payable_user_adder",
        blank=True,
        null=True,
    )
    user_closer = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="payable_user_closer",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.lender_name} - {self.description}"


class Sale(models.Model):
    PAYMENT_CHOICES = (
        ("1", "none"),
        ("2", "proc"),
        ("3", "paid"),
    )
    payment = models.ManyToManyField(
        Transaction,
        blank=True,
        related_name="payment_sales",
    )
    status = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default="1")
    to_print = models.BooleanField(default=False)
    customer_name = models.CharField(max_length=60, default="", blank=True)
    datetime_opened = models.DateTimeField(default=timezone.now)
    datetime_closed = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    discount = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    user_adder = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="sales_user_adder",
        blank=True,
        null=True,
    )
    user_validator = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="sales_user_validator",
        blank=True,
        null=True,
    )
    user_closer = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="sales_user_closer",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.customer_name}"


class SalesItem(models.Model):
    sales = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="sales_item")
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, related_name="sales_product", null=True
    )
    description = models.CharField(max_length=200, default="", blank=True)
    unit = models.CharField(max_length=30, default="", blank=True)
    quantity = models.DecimalField(
        default=1, decimal_places=2, max_digits=10, validators=[MinValueValidator(0)]
    )
    is_claimed = models.BooleanField(default=False)
    selling_price = models.DecimalField(
        max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    user_adder = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="sales_item_user_adder",
        blank=True,
        null=True,
    )
    user_giver = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="sales_item_user_giver",
        blank=True,
        null=True,
    )
    datetime_added = models.DateTimeField(default=timezone.now)
    datetime_claimed = models.DateTimeField(blank=True, null=True)


class ReturnedItem(models.Model):
    sales = models.ForeignKey(
        Sale, on_delete=models.CASCADE, related_name="returned_item"
    )
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, related_name="returned_product", null=True
    )
    quantity = models.DecimalField(
        default=1, decimal_places=2, max_digits=10, validators=[MinValueValidator(0)]
    )
    description = models.CharField(max_length=200, default="", blank=True)
    unit = models.CharField(max_length=30, default="", blank=True)
    selling_price = models.DecimalField(
        max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    user = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="returned_item_user",
        blank=True,
        null=True,
    )
    datetime_added = models.DateTimeField(default=timezone.now)


class LaborItem(models.Model):
    sales = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="labor_item")
    labor_name = models.CharField(max_length=200, default="")
    mechanic = models.ForeignKey(
        Mechanic, on_delete=models.SET_NULL, related_name="labor_mechanic", null=True
    )
    is_done = models.BooleanField(default=False)
    amount_received = models.DecimalField(
        max_digits=15, decimal_places=2, validators=[MinValueValidator(0)]
    )
    amount_returned = models.DecimalField(
        max_digits=15, decimal_places=2, validators=[MinValueValidator(0)]
    )
    amount_owed = models.DecimalField(
        max_digits=15, decimal_places=2, validators=[MinValueValidator(0)]
    )
    user_adder = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="labor_user_adder",
        blank=True,
        null=True,
    )
    user_giver = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="labor_user_giver",
        blank=True,
        null=True,
    )
    datetime_added = models.DateTimeField(default=timezone.now)
    datetime_done = models.DateTimeField(blank=True, null=True)


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(
        Purchase, on_delete=models.CASCADE, related_name="purchase_item"
    )
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, related_name="purchase_product", null=True
    )
    description = models.CharField(max_length=200, default="", blank=True)
    unit = models.CharField(max_length=10, default="PC")
    quantity = models.DecimalField(
        default=1, decimal_places=2, max_digits=10, validators=[MinValueValidator(0)]
    )
    is_valid = models.BooleanField(default=True)
    purchase_price = models.DecimalField(
        max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], default=0
    )
    user_adder = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="purchase_item_user_adder",
        blank=True,
        null=True,
    )
    user_giver = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="purchase_item_user_giver",
        blank=True,
        null=True,
    )
    datetime_added = models.DateTimeField(default=timezone.now)
    datetime_claimed = models.DateTimeField(blank=True, null=True)


class CountItem(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, related_name="count_product", null=True
    )
    quantity = models.DecimalField(default=0, decimal_places=2, max_digits=10)
    user_counter = models.ForeignKey(
        MyUser,
        on_delete=models.SET_NULL,
        related_name="count_item_user_counter",
        blank=True,
        null=True,
    )
    datetime_counted = models.DateTimeField(default=timezone.now)
    is_pending = models.BooleanField(default=False)
