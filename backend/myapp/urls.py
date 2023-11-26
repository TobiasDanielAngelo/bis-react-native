from django.urls import include, path
from knox.views import LogoutView as KnoxLogoutView
from rest_framework.routers import DefaultRouter

from . import views
from .viewsets import (
    AccountViewSet,
    CategoryViewSet,
    MechanicViewSet,
    MotorViewSet,
    MyUserViewSet,
    ProductViewSet,
    SaleViewSet,
    LaborItemViewSet,
    SparePartViewSet,
    SalesItemViewSet,
    TransactionViewSet,
    ReturnedItemViewSet,
    PayableViewSet,
    ReceivableViewSet,
    PurchaseItem2ViewSet,
    PurchaseViewSet,
    CountItemViewSet,
)

router = DefaultRouter()
router.register(r"users", MyUserViewSet, basename="users")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"motors", MotorViewSet, basename="motor")
router.register(r"spareparts", SparePartViewSet, basename="sparepart")
router.register(r"mechanics", MechanicViewSet, basename="mechanic")
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"purchases", PurchaseViewSet, basename="purchases")
router.register(r"sales", SaleViewSet, basename="sales")
router.register(r"sales_items", SalesItemViewSet, basename="sales_items")
router.register(r"count_items", CountItemViewSet, basename="count_items")
router.register(r"labor_items", LaborItemViewSet, basename="labor_items")
router.register(r"returned_items", ReturnedItemViewSet, basename="returned_items")
router.register(r"purchase_items", PurchaseItem2ViewSet, basename="purchase_items")
router.register(r"transactions", TransactionViewSet, basename="transactions")
router.register(r"payables", PayableViewSet, basename="payables")
router.register(r"receivables", ReceivableViewSet, basename="receivables")


urlpatterns = [
    path("", include(router.urls)),
    path("login", views.LoginAPI.as_view(), name="login"),
    path("logout", KnoxLogoutView.as_view(), name="logout"),
    path("reauth", views.ReauthAPI.as_view(), name="reauth"),
]
