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
    Transaction,
    TransactionLineItem,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImageLineItem


class TransactionItemInline(admin.TabularInline):
    min_num = 1
    model = TransactionLineItem


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "nature", "logo", "pk")


class AccountAdmin(admin.ModelAdmin):
    list_display = ("__str__", "name")


class TransactionAdmin(admin.ModelAdmin):
    model = Transaction
    list_display = (
        "category",
        "description",
        "datetime_transacted",
        "pk",
        "transmitter",
        "receiver",
    )
    inlines = (TransactionItemInline,)


class ProductAdmin(admin.ModelAdmin):
    model = Product
    list_display = ("part", "generic", "purchase_price", "sell_price", "pk")
    inlines = (ProductImageInline,)


class MotorAdmin(admin.ModelAdmin):
    model = Motor
    list_display = ("name", "maker")


class MyUserAdmin(admin.ModelAdmin):
    model = MyUser
    list_display = ("user_id", "username")


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
    list_display = ("name", "color")


admin.site.register(Motor, MotorAdmin)
admin.site.register(Mechanic, MechanicAdmin)
admin.site.register(SparePart, SparePartAdmin)
admin.site.register(MyUser, MyUserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Account, AccountAdmin)
