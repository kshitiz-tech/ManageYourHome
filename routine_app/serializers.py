from rest_framework import serializers
from .models import List
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

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


