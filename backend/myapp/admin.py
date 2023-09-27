from django.contrib import admin
from .models import (
    MyUser,
    Product,
    Transaction,
    Category,
    TransactionLineItem,
    ProductImageLineItem,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImageLineItem


class TransactionItemInline(admin.TabularInline):
    min_num = 1
    model = TransactionLineItem


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "nature", "logo", "pk")


class TransactionAdmin(admin.ModelAdmin):
    model = Transaction
    list_display = (
        "category",
        "description",
        "datetime_transacted",
        "pk",
        "transmitter",
    )
    inlines = (TransactionItemInline,)


class ProductAdmin(admin.ModelAdmin):
    model = Product
    list_display = ("description", "location", "pk", "sell_price")
    inlines = (ProductImageInline,)


class MyUserAdmin(admin.ModelAdmin):
    model = MyUser
    list_display = ("user_id", "username")


admin.site.register(MyUser, MyUserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Transaction, TransactionAdmin)
