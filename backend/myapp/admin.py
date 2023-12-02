from django.contrib import admin
from django.db.models import Count

from .models import (
    Account,
    Category,
    Mechanic,
    Motor,
    MyUser,
    Product,
    ProductImageLineItem,
    SparePart,
    Sale,
    Purchase,
    PurchaseItem,
    ReturnedItem,
    SalesItem,
    LaborItem,
    Transaction,
    Receivable,
    Payable,
    CountItem,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImageLineItem


class SalesItemInline(admin.TabularInline):
    min_num = 0
    model = SalesItem


class ReturnedItemInline(admin.TabularInline):
    min_num = 0
    model = ReturnedItem


class LaborItemInline(admin.TabularInline):
    min_num = 0
    model = LaborItem


class PurchaseItemInline(admin.TabularInline):
    min_num = 0
    model = PurchaseItem


class LaborItemAdmin(admin.ModelAdmin):
    model = LaborItem
    list_display = (
        "id",
        "mechanic",
        "labor_name",
        "amount_received",
        "amount_owed",
        "amount_returned",
    )


class SaleItemAdmin(admin.ModelAdmin):
    model = SalesItem


class PurchaseItemAdmin(admin.ModelAdmin):
    model = PurchaseItem


class ReturnItemAdmin(admin.ModelAdmin):
    model = ReturnedItem


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "nature", "logo", "pk")


class AccountAdmin(admin.ModelAdmin):
    list_display = ("__str__", "name")


class TransactionAdmin(admin.ModelAdmin):
    model = Transaction
    list_display = (
        "id",
        "category",
        "description",
        "transmitter",
        "receiver",
        "amount",
        "datetime_transacted",
    )


class ProductAdmin(admin.ModelAdmin):
    model = Product
    list_display = ("part", "purchase_price", "sell_price", "pk")
    inlines = (ProductImageInline,)


class MotorAdmin(admin.ModelAdmin):
    model = Motor
    list_display = ("name", "maker")


class ReceivableAdmin(admin.ModelAdmin):
    model = Receivable
    list_display = ("pk", "borrower_name", "description", "lent_amount")


class PayableAdmin(admin.ModelAdmin):
    model = Payable
    list_display = ("pk", "lender_name", "description", "borrowed_amount")


class MyUserAdmin(admin.ModelAdmin):
    model = MyUser
    list_display = ("user_id", "username", "privilege")


class SparePartAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super(SparePartAdmin, self).get_queryset(request)
        return qs.annotate(product_count=Count("product_part")).order_by(
            "-product_count"
        )

    def product_count(self, instance):
        return instance.product_count

    model = SparePart
    list_editable = ("is_semi_shown",)
    list_display = ("name", "product_count", "is_motor_shown", "is_semi_shown", "id")


class MechanicAdmin(admin.ModelAdmin):
    model = Mechanic
    list_display = ("name", "color", "id")


class SalesAdmin(admin.ModelAdmin):
    model = Sale
    list_display = ("customer_name", "pk", "is_active")
    inlines = (SalesItemInline, LaborItemInline, ReturnedItemInline)


class PurchaseAdmin(admin.ModelAdmin):
    model = Purchase
    list_display = ("supplier_name", "pk", "is_active")
    inlines = (PurchaseItemInline,)


class CountItemAdmin(admin.ModelAdmin):
    model = CountItem
    list_display = ("product", "quantity", "datetime_counted")


admin.site.register(Motor, MotorAdmin)
admin.site.register(Mechanic, MechanicAdmin)
admin.site.register(SparePart, SparePartAdmin)
admin.site.register(MyUser, MyUserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Account, AccountAdmin)
admin.site.register(Sale, SalesAdmin)
admin.site.register(Purchase, PurchaseAdmin)
admin.site.register(Payable, PayableAdmin)
admin.site.register(Receivable, ReceivableAdmin)
admin.site.register(CountItem, CountItemAdmin)
admin.site.register(SalesItem, SaleItemAdmin)
admin.site.register(LaborItem, LaborItemAdmin)
admin.site.register(ReturnedItem, ReturnItemAdmin)
admin.site.register(PurchaseItem, PurchaseItemAdmin)
