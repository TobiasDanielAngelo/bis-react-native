from django.urls import path, include
from . import views
from knox.views import LogoutView as KnoxLogoutView
from rest_framework.routers import DefaultRouter
from .viewsets import (
    ProductViewSet,
    TransactionViewSet,
    ExpenseViewSet,
    IncomeViewSet,
    CategoryViewSet,
    PointOfSaleViewSet,
    POSItemViewSet,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"incomes", IncomeViewSet, basename="income")
router.register(r"sales", PointOfSaleViewSet, basename="sales")
router.register(r"particularpos", POSItemViewSet, basename="particularpos")

urlpatterns = [
    path("", include(router.urls)),
    path("login", views.LoginAPI.as_view(), name="login"),
    path("logout", KnoxLogoutView.as_view(), name="logout"),
    path("reauth", views.ReauthAPI.as_view(), name="reauth"),
]
