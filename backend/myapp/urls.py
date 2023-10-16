from django.urls import include, path
from knox.views import LogoutView as KnoxLogoutView
from rest_framework.routers import DefaultRouter

from . import views
from .viewsets import (
    CategoryViewSet,
    ExpenseViewSet,
    IncomeViewSet,
    MechanicViewSet,
    MotorViewSet,
    PointOfSaleViewSet,
    POSItemViewSet,
    ProductViewSet,
    SparePartViewSet,
    TransactionViewSet,
    PurchasePartViewSet,
    PurchaseItemViewSet,
    MyUserViewSet,
)

router = DefaultRouter()
router.register(r"users", MyUserViewSet, basename="users")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"motors", MotorViewSet, basename="motor")
router.register(r"spareparts", SparePartViewSet, basename="sparepart")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"incomes", IncomeViewSet, basename="income")
router.register(r"mechanics", MechanicViewSet, basename="mechanic")
router.register(r"sales", PointOfSaleViewSet, basename="sales")
router.register(r"purchases", PurchasePartViewSet, basename="purchases")
router.register(r"particularpos", POSItemViewSet, basename="particularpos")
router.register(r"particularorders", PurchaseItemViewSet, basename="particularorders")


urlpatterns = [
    path("", include(router.urls)),
    path("login", views.LoginAPI.as_view(), name="login"),
    path("logout", KnoxLogoutView.as_view(), name="logout"),
    path("reauth", views.ReauthAPI.as_view(), name="reauth"),
]
