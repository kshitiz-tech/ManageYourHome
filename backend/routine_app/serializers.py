from rest_framework import serializers
from .models import List
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=False,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

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


