from django.contrib import admin

from .models import (
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
    list_display = ("generic", "pk")
    inlines = (ProductImageInline,)


class MotorAdmin(admin.ModelAdmin):
    model = Motor
    list_display = ("name", "maker")


class MyUserAdmin(admin.ModelAdmin):
    model = MyUser
    list_display = ("user_id", "username")


class SparePartAdmin(admin.ModelAdmin):
    model = SparePart
    list_display = ("name",)


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
