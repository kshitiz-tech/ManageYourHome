
from rest_framework import generics
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from routine_app.models import List
from routine_app.serializers import (
    ListSerializer, UserSerializer, BroughtBy, BroughtTo,
    RegisterSerializer, LoginResponseSerializer
)
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .utils.total_expense import collect_item

# Create your views here.

# JWT Authentication Views
class RegisterView(generics.CreateAPIView):
    """
    Register a new user and return JWT tokens
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email or ''
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login user and return JWT tokens with user info
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email or ''
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Logout user by blacklisting the refresh token
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'message': 'Logout successful'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

   
#this view is to list all the items of the user
class ListLists(generics.ListAPIView):
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

#this view is to create the items
class CreateList(generics.CreateAPIView):
    
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner = self.request.user)
    

#this view is for each item in the list for retrieving updating and destroying 
class Lists_Details(generics.RetrieveUpdateDestroyAPIView):

    def get_queryset(self, pk):
        return List.objects.get(pk = pk)
    
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

#this view is for specific listing of items for which the user has brought
class UserBroughtBy(generics.RetrieveAPIView):

    def get_queryset(self,pk):
        user = User.objects.get(id = pk)
        return  user.brought_by.all()
  
    serializer_class = BroughtBy
    permission_classes = [permissions.IsAuthenticated]

#this view is for specific listing of list for which the items were brought to the user by the user himself or the other user 
class UserBroughtTo(generics.RetrieveAPIView):
    
    def get_queryset(self,pk):
        user = User.objects.get(id = pk)
        return user.brought_to_you.all()
    

    serializer_class = BroughtTo
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_expense(request, pk):
    try:
        data = collect_item(pk)
        return Response(data=data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

