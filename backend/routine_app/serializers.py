from rest_framework import serializers
from .models import List
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ListSerializer(serializers.ModelSerializer):

    owner = serializers.ReadOnlyField(source = "owner.username")
    class Meta:
        model = List
        fields = ['item_name', 'category','price','owner','created_at','brought_to','brought_by']


class BroughtBy(serializers.ModelSerializer):

    class Meta:
        model = List
        fields = ['brought_by']

class BroughtTo(serializers.ModelSerializer):
    
    class Meta:
        model = List
        fields = ['brought_to']

#serialize the response comming from the expenseview()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.username
        # ...

        return token

