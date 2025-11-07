from rest_framework import serializers
from .models import Item, List
from django.contrib.auth.models import User
from routine_app.utils.total_expense import collect_item
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}


class ItemSerializer(serializers.ModelSerializer):
    calculated_data = serializers.SerializerMethodField()
    class Meta:
        model = Item
        fields = "__all__"
        extra_fields = ["calculated_data"]

    def get_calculated_data(self, obj):

        result = collect_item(instance= obj)
        if result["item_data"]:
            return result["item_data"][0]
        
        return None

class ListSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source = "owner.username")
    class Meta:
        model = List
        fields = ['list_name','created_at','owner','items']


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

