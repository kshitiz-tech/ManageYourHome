from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from routine_app.models import List, Item
from routine_app.serializers import (
    UserSerializer, ListSerializer, MyTokenObtainPairSerializer, ItemSerializer
)
from routine_app.utils.total_expense import collect_item
from rest_framework_simplejwt.views import TokenObtainPairView
import inspect




class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class ItemView(generics.ListAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class ListListCreateView(generics.ListCreateAPIView):
    queryset = List.objects.prefetch_related('items')
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ListDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = List.objects.prefetch_related('items')
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        list_obj = self.get_object()
        serializer = self.get_serializer(list_obj)
        print("collect_item loaded from:", inspect.getfile(collect_item))
        collected_data = collect_item(instance=list_obj)

        return Response({
            "list": serializer.data,
            "totals": collected_data
        })


class UserBroughtByView(generics.ListAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['pk']
        return Item.objects.filter(brought_by__id=user_id)


class UserBroughtToView(generics.ListAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['pk']
        return Item.objects.filter(brought_to__id=user_id)
    

class ListItemView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        list_id = self.kwargs['list_id']
        return Item.objects.filter(list__id=list_id)

    def perform_create(self, serializer):
        list_id = self.kwargs['list_id']
        list_instance = List.objects.get(id=list_id)
        serializer.save(list=list_instance, brought_by =self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_expense(request, pk):
    try:
        data = collect_item(pk)
        return Response(data=data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
