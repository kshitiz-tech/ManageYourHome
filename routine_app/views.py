from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth.models import User
from routine_app.models import List
from routine_app.serializers import ListSerializer, UserSerializer, BroughtBy, BroughtTo
# Create your views here.

class CreateUser(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class ListLists(generics.ListAPIView):
    queryset = List.objects.all()
    serializer_class = ListSerializer

class CreateList(generics.CreateAPIView):
    
    queryset = List.objects.all()
    serializer_class = ListSerializer

class Lists_Details(generics.RetrieveUpdateDestroyAPIView):
    queryset = List.objects.all()
    serializer_class = ListSerializer

class UserBroughtBy(generics.RetrieveAPIView):

    def get_queryset(self, pk):
        user = User.objects.get(id = pk)
        return  user.brought_by.all()
    
    serializer_class = BroughtBy
    
class UserBroughtTo(generics.RetrieveAPIView):
    
    def get_queryset(self,pk):
        user = User.objects.get(id = pk)
        return user.brought_to_you.all()
    serializer_class = BroughtTo
    



