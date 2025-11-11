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
    brought_by = UserSerializer(read_only= True)
    brought_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),many = True )
    calculated_data = serializers.SerializerMethodField()
    class Meta:
        model = Item
        fields = [
            'id',
            'item_name',
            'category',
            'price',
            'brought_by',
            'brought_to',
            'created_at',
            'calculated_data'
        ]

    def get_calculated_data(self, obj):

        result = collect_item(instance= obj)
        if result["item_data"]:
            return result["item_data"][0]
        
        return None
    
    def create(self, validated_data):
        brought_to = validated_data.pop('brought_to', [])
        item = Item.objects.create(**validated_data)
        if brought_to:
            item.brought_to.set(brought_to)
        return item

    def update(self, instance, validated_data):
        brought_to = validated_data.pop('brought_to', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if brought_to is not None:
            instance.brought_to.set(brought_to)
        return instance

class ListSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many= True, read_only= True)


    class Meta:
        model = List
        fields = ['id','list_name','created_at','items']


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

