
from rest_framework import generics
from django.contrib.auth.models import User
from routine_app.models import List
from routine_app.serializers import ListSerializer, UserSerializer, BroughtBy, BroughtTo
from rest_framework import permissions

# Create your views here.

#this view is to create new user
class CreateUser(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(owner = self.request.user)
    
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




