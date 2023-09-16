from django.contrib.auth import authenticate, login
from django.contrib.auth.signals import user_logged_in
from .models import MyUser
from .serializers import LoginSerializer
from knox.views import LoginView as KnoxLoginView
from knox.auth import AuthToken
from rest_framework import permissions, response, status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication


class LoginAPI(KnoxLoginView):
    authentication_classes = [
        TokenAuthentication,
    ]
    permission_classes = [
        permissions.AllowAny,
    ]
    api_view = ["POST", "GET"]

    def get(self, request):
        content = {
            "username": ["This field is required,"],
            "password": ["This field is required,"],
        }
        return response.Response(content)

    def post(self, request, *args, **kwargs):
        user = MyUser.objects.filter(username=request.data.get("username")).first()
        if user != None:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
            _, token = AuthToken.objects.create(user)
            authenticated_user = authenticate(
                request, username=user.username, password=request.data["password"]
            )
            if authenticated_user.is_authenticated:
                data = {
                    "key": token,
                    "user": {
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "privilege": user.privilege,
                        "user_id": user.user_id,
                        "is_active": user.is_active,
                    },
                }
                return response.Response(data)
            else:
                return response.Response(
                    {
                        "error": "Wrong password",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return response.Response(
                {
                    "error": "User does not exist",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class ReauthAPI(APIView):
    permission_classes = [
        permissions.AllowAny,
    ]

    def post(self, request):
        token_key = request.headers["Authorization"].split(" ")[1][0:8]
        auth_token = AuthToken.objects.get(token_key=token_key)
        if auth_token is not None:
            user = MyUser.objects.get(user_id=auth_token.user_id)
            login(request, user)
            data = {
                "key": request.headers["Authorization"].split(" ")[1],
                "user": {
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "privilege": user.privilege,
                    "user_id": user.user_id,
                    "is_active": user.is_active,
                },
            }
            return response.Response(data)
